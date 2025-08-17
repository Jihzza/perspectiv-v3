import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const PAGE_SIZE = 20;

function timeAgo(iso) {
  const t = new Date(iso || Date.now()).getTime();
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("chat_session_overview")
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false })
        .range(from, to);

      if (error) console.error(error);
      setRows((prev) => (page === 0 ? data ?? [] : [...prev, ...(data ?? [])]));
      if (!data || data.length < PAGE_SIZE) setDone(true);
      setLoading(false);
    })();
  }, [user, page]);

  const hasRows = useMemo(() => (rows?.length ?? 0) > 0, [rows]);

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <p className="mb-4">Please sign in to view your chat history.</p>
          <button
            onClick={() => navigate("/login")}
            className="rounded-xl px-4 py-2 bg-white text-black font-medium"
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
        {/* Header card (match Notifications/Profile style) */}
        <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Chat History</h1>
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
              >
                Back to Profile
              </Link>
              {!done && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {/* Empty state */}
          {!loading && !hasRows && (
            <div className="rounded-xl border border-white/20 p-8 text-center text-gray-300 bg-white/5">
              <div className="text-2xl mb-2">🗂️</div>
              <p className="text-lg">No conversations yet</p>
              <p className="text-sm opacity-75">Start a chat from the home page and it will appear here.</p>
            </div>
          )}

          {/* Skeletons when first load */}
          {loading && page === 0 && (
            <ul className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 w-48 bg-white/20 rounded" />
                    <div className="h-5 w-16 bg-white/10 rounded-full" />
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded" />
                </li>
              ))}
            </ul>
          )}

          {/* Sessions list */}
          {hasRows && (
            <ul className="space-y-3">
              {rows.map((row) => {
                const title =
                  row.last_user_message?.slice(0, 60) ||
                  row.last_assistant_message?.slice(0, 60) ||
                  `Session ${row.session_id.slice(0, 8)}`;
                const ts = row.last_message_at || row.created_at;
                return (
                  <li
                    key={row.session_id}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all"
                  >
                    <Link to={`/profile/chat-history/${row.session_id}`} className="block p-4">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h3 className="font-semibold leading-tight text-lg truncate">{title}</h3>
                        <time className="text-xs text-gray-400 whitespace-nowrap bg-black/20 px-2 py-1 rounded-full">
                          {timeAgo(ts)}
                        </time>
                      </div>
                      <p className="text-sm text-gray-200/90 line-clamp-2">
                        {row.last_assistant_message || row.last_user_message || "—"}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                        <span className="inline-flex items-center gap-1 bg-white/10 border border-white/15 px-2 py-1 rounded-full">
                          {row.messages_count} messages
                        </span>
                        <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                          {row.session_id.slice(0, 8)}…
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Load more at bottom for long lists */}
          {hasRows && !done && (
            <div className="mt-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
