// src/pages/ProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // adjust path if needed
import OctagonAvatar from "../components/Layout/OctagonAvatar";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // ---- Load Auth User ----
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data?.user ?? null;
      setUser(u);
      setIdentities(u?.identities ?? []);
      setLoading(false);

      // fetch profile row (simple, single query)
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

      // refresh profile when auth changes
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


  // ---- Derived fields (prefer profiles table, then auth metadata, then fallbacks) ----
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

  if (loading) {
    return (
      <div className="h-screen grid place-items-center text-white/80">Loading profile…</div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen grid place-items-center text-white">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <p className="mb-4">You’re not signed in.</p>
          <Link to="/login" className="inline-block bg-white text-black px-4 py-2 rounded-lg">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <OctagonAvatar
                  src={avatarUrl}
                  alt={displayName}
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
            </div>

            {/* Profile Info Section */}
            <div className="flex w-full text-center justify-center min-w-0">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-white">{displayName}</div>
                {username && (
                  <div className="text-lg text-white/70 font-medium">@{username}</div>
                )}
                <div className="text-sm text-white/60">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Edit Button Section */}
            <div className="flex-shrink-0 self-center">
              <Link
                to="/profile/edit"
                className="flex items-center justify-center text-center gap-2 rounded-xl px-4 py-3 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
              >
                <span className="font-medium">Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chatbot</h3>
            <Link
              to="/profile/chat-history"
              className="text-sm font-medium border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              View History
            </Link>
          </div>
        </div>


        {/* Overview Card (simple placeholders) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-sm text-white/70">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-sm text-white/70">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-sm text-white/70">Following</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
