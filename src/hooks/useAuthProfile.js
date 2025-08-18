// src/hooks/useAuthProfile.js
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // adjust if your path differs

export function useAuthProfile() {
  const [user, setUser] = useState(null);
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data?.user ?? null;
      setUser(u);
      setIdentities(u?.identities ?? []);
      setLoading(false);

      if (u?.id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url, updated_at")
          .eq("id", u.id)
          .single();
        if (mounted) setProfile(p || null);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIdentities(u?.identities ?? []);

      if (u?.id) {
        supabase
          .from("profiles")
          .select("full_name, username, avatar_url, updated_at")
          .eq("id", u.id)
          .single()
          .then(({ data: p }) => setProfile(p || null));
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const authMeta = user?.user_metadata || {};

  const displayName = useMemo(() => {
    return (
      profile?.full_name ||
      authMeta.full_name ||
      authMeta.name ||
      authMeta.user_name ||
      user?.email?.split("@")[0] ||
      "User"
    );
  }, [profile, authMeta, user]);

  const username = useMemo(() => {
    return (
      profile?.username ||
      authMeta.preferred_username ||
      authMeta.user_name ||
      user?.email?.split("@")[0] ||
      ""
    );
  }, [profile, authMeta, user]);

  const avatarUrl = useMemo(() => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (authMeta.avatar_url) return authMeta.avatar_url;
    const google = (identities || []).find((i) => i.provider === "google");
    const pic = google?.identity_data?.avatar_url || google?.identity_data?.picture;
    return pic || null;
  }, [profile, authMeta, identities]);

  const initials = useMemo(() => {
    const parts = (displayName || "").trim().split(/\s+/);
    return (
      parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || "")
        .join("") || "U"
    );
  }, [displayName]);

  return { user, identities, loading, profile, displayName, username, avatarUrl, initials };
}