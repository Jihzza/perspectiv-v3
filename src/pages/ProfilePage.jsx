// src/pages/ProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // adjust path if needed

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    let mounted = true;

    // Load the freshest user (validates token on the server)
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
      setIdentities(data?.user?.identities ?? []);
      setLoading(false);
      if (data?.user) {
        const md = data.user.user_metadata || {};
        setNameDraft(md.full_name || md.name || md.user_name || "");
      }
    });

    // Keep UI in sync with auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIdentities(u?.identities ?? []);
      const md = u?.user_metadata || {};
      setNameDraft(md.full_name || md.name || md.user_name || "");
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const displayName = useMemo(() => {
    const md = user?.user_metadata || {};
    return md.full_name || md.name || md.user_name || user?.email?.split("@")[0] || "User";
  }, [user]);

  const providers = useMemo(() => {
    const ids = identities || [];
    return ids.length ? ids.map((i) => i.provider) : ["email"];
  }, [identities]);

  const avatarUrl = useMemo(() => {
    const md = user?.user_metadata || {};
    if (md.avatar_url) return md.avatar_url; // many OAuth providers put it here
    // try identities → google identity_data.picture / avatar_url
    const google = (identities || []).find((i) => i.provider === "google");
    const pic = google?.identity_data?.avatar_url || google?.identity_data?.picture;
    return pic || null;
  }, [user, identities]);

  const initials = useMemo(() => {
    const parts = (displayName || "").trim().split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || "").join("") || "U";
  }, [displayName]);

  const createdAt = user?.created_at ? new Date(user.created_at) : null;

  async function saveName(e) {
    e.preventDefault();
    if (!user) return;
    // Save to user_metadata for a consistent app-wide display name
    const { error } = await supabase.auth.updateUser({ data: { full_name: nameDraft } });
    if (error) {
      console.error(error.message);
      return;
    }
    // refresh local copy
    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
  }

  if (loading) {
    return (
      <div className="h-screen text-white px-4">
        <p className="opacity-80">Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full text-white grid place-items-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <p className="mb-4">You’re not signed in.</p>
          <Link to="/login" className="inline-block bg-white text-black px-4 py-2 rounded-lg">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-[#1B2537] to-[#000000] text-white py-8">
      <div className="h-screen mx-auto px-4 py-8">

        <div className="max-w-2xl space-y-6">
          {/* Card: hero row with avatar + basics */}
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center gap-5 mb-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full bg-gradient-to-b from-[#1B2537] to-[#000000] text-white py-8">
                  {initials}
                </div>
              )}

              <div>
                <h3 className="text-2xl font-semibold leading-tight">{displayName}</h3>
                <p className="text-gray-300">{user.email}</p>                
              </div>
            </div>

            {/* Simple “edit name” form (optional) */}
            <form onSubmit={saveName} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <input
                className="ui-input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Your display name"
              />
              <button
                type="submit"
                className="bg-white text-black px-4 py-2 rounded-lg font-medium"
              >
                Save
              </button>
            </form>
          </div>

          {/* Minimal stats / placeholder card (keep it simple & clean) */}
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3">Overview</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-300">—</div>
                <div className="text-sm text-gray-300">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-300">—</div>
                <div className="text-sm text-gray-300">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">—</div>
                <div className="text-sm text-gray-300">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
