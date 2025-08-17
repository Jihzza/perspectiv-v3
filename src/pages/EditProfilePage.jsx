// src/pages/EditProfilePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import OctagonAvatar from "../components/Layout/OctagonAvatar";

export default function EditProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // drafts
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getUser().then(async ({ data }) => {
            if (!mounted) return;
            const u = data?.user ?? null;
            setUser(u);
            if (u) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, username, avatar_url")
                    .eq("id", u.id)
                    .single();
                setFullName(profile?.full_name || "");
                setUsername(profile?.username || "");
                setAvatarPreview(profile?.avatar_url || null);
            }
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
            setUser(session?.user ?? null);
        });
        return () => sub?.subscription?.unsubscribe?.();
    }, []);

    const initials = useMemo(() => {
        const parts = (fullName || username || "User").trim().split(/\s+/);
        return (
            parts
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() || "")
                .join("") || "U"
        );
    }, [fullName, username]);

    function onPickFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        // preview (no upload yet)
        const url = URL.createObjectURL(file);
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

    async function onSave(e) {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            const { avatar_url } = await uploadAvatarIfNeeded();
            const payload = {
                id: user.id,
                full_name: fullName?.trim() || null,
                username: username?.trim() || null,
                ...(avatar_url ? { avatar_url } : {}),
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from("profiles").upsert(payload, {
                onConflict: "id",
            });
            if (error) throw error;
            // Go back to profile
            navigate("/profile");
        } catch (err) {
            console.error(err);
            alert(err?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="h-screen grid place-items-center text-white/80">Loading…</div>
        );
    }
    if (!user) {
        return (
            <div className="h-screen grid place-items-center text-white">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                    <p className="mb-2">Sign in to edit your profile.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
                    >
                        Log in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
                {/* Card wrapper to match ProfilePage */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h1 className="text-2xl font-bold tracking-tight">Edit profile</h1>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-4 py-2">
                        {avatarPreview ? (
                            <OctagonAvatar
                                src={avatarPreview}
                                size={112}
                                ringWidth={3}
                                gap={6}
                                ringColor="#24C8FF"
                                className="shrink-0"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full ring-3 ring-white/20 bg-white/10 grid place-items-center text-2xl font-semibold shadow-lg">
                                {initials}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                className="rounded-xl p-2 bg-white text-black font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => inputRef.current?.click()}
                            >
                                Change photo
                            </button>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onPickFile}
                            />
                        </div>
                    </div>

                    <div className="my-4 h-px w-full bg-white/10" />

                    {/* Form */}
                    <form onSubmit={onSave} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium mb-2 text-white/90">Full Name</label>
                            <input
                                className="w-full bg-black/10 border border-[#24C8FF] rounded-lg px-2 py-1"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                type="text"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium mb-2 text-white/90">Username</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-black/10 border border-[#24C8FF] rounded-lg px-7 py-1"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                    placeholder="username"
                                    pattern="[a-z0-9_\.\-]{3,32}"
                                    title="3–32 chars: lowercase letters, numbers, underscore, dot, or hyphen"
                                    type="text"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-lg">@</span>
                            </div>
                            <p className="mt-2 text-xs text-white/60">
                                Only lowercase letters, numbers, underscore, dot, or hyphen. 3–32 characters.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
                            >
                                Go Back
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl px-4 py-2 bg-white text-black font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
