// src/hooks/useEditProfile.js
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthProfile } from "./useAuthProfile";

function normalizeUsername(v = "") {
  return v.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 32);
}

export function useEditProfile() {
  const { user, profile } = useAuthProfile();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);

  // hydrate from profile when available
  useEffect(() => {
    setFullName(profile?.full_name || "");
    setUsername(profile?.username || "");
    setAvatarPreview(profile?.avatar_url || null);
  }, [profile]);

  // cleanup object URLs to avoid leaks
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarPreview(url);
  }

  async function uploadAvatarIfNeeded() {
    if (!avatarFile || !user) return { avatar_url: null };
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: avatarFile.type || "image/jpeg",
      });
    if (upErr) throw upErr;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return { avatar_url: data?.publicUrl || null };
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const { avatar_url } = await uploadAvatarIfNeeded();
      const payload = {
        id: user.id,
        full_name: fullName?.trim() || null,
        username: normalizeUsername(username?.trim() || "") || null,
        ...(avatar_url ? { avatar_url } : {}),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return true;
    } finally {
      setSaving(false);
    }
  }

  const initials = useMemo(() => {
    const src = fullName || username || "User";
    const parts = src.trim().split(/\s+/);
    return (parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("")) || "U";
  }, [fullName, username]);

  return {
    user,
    fullName,
    setFullName,
    username,
    setUsername,
    avatarPreview,
    onPickFile,
    inputRef,
    saveProfile,
    saving,
    initials,
  };
}