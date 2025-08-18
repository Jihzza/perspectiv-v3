// src/hooks/useNotifications.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/** Safely resolve envs across build tools */
function resolveEnv() {
  const nextUrl   = (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) || undefined;
  const nextKey   = (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || undefined;

  const viteUrl   = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || undefined;
  const viteKey   = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || undefined;

  const winUrl    = (typeof window !== "undefined" && window.__SUPABASE_URL__) || undefined;
  const winKey    = (typeof window !== "undefined" && window.__SUPABASE_ANON_KEY__) || undefined;

  return {
    url: nextUrl || viteUrl || winUrl,
    anon: nextKey || viteKey || winKey,
  };
}

let defaultClient = null;
function getClient(overrides) {
  if (overrides?.supabase) return overrides.supabase;
  if (defaultClient) return defaultClient;

  const env = resolveEnv();
  const url = overrides?.url ?? env.url;
  const anon = overrides?.anon ?? env.anon;

  if (!url || !anon) {
    console.warn("[useNotifications] Missing Supabase URL/anon key. Pass {supabase} or set env vars.");
    return null;
  }
  defaultClient = createClient(url, anon);
  return defaultClient;
}

/** Optional: pass { supabase } or { url, anon } */
export function useNotifications(options) {
  const supabase = getClient(options);

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "unread" | "read"
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(() => items.filter(n => !n.read).length, [items]);

  const shape = (row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.created_at,
    read: !!row.read_at,
    read_at: row.read_at,
    seen_at: row.seen_at,
    payload: row.payload,
    type: row.type,
    topic: row.topic,
  });

  const fetchAll = useCallback(async () => {
    if (!supabase) { setItems([]); setLoading(false); return; }
    setLoading(true);

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) { setItems([]); setLoading(false); return; }

    let q = supabase.from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filter === "unread") q = q.is("read_at", null);
    else if (filter === "read") q = q.not("read_at", "is", null);

    const { data, error } = await q;
    if (error) { console.error("[useNotifications] fetch error:", error); setItems([]); }
    else { setItems((data ?? []).map(shape)); }

    setLoading(false);
  }, [filter, supabase]);

  const markRead = useCallback(async (id) => {
    if (!supabase) return;
    const { error } = await supabase.rpc("mark_notification_read", { p_id: id });
    if (error) console.error("[useNotifications] mark_notification_read error:", error);
  }, [supabase]);

  const markAllRead = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.rpc("mark_all_notifications_read");
    if (error) console.error("[useNotifications] mark_all_notifications_read error:", error);
  }, [supabase]);

  const timeAgo = useCallback((iso) => {
    const now = new Date();
    const then = new Date(iso);
    const diff = Math.max(0, now - then);
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return then.toLocaleDateString();
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!supabase) return;
    let channel = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          { schema: "public", table: "notifications", event: "*", filter: `user_id=eq.${user.id}` },
          () => fetchAll()
        )
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [fetchAll, supabase]);

  const filtered = useMemo(() => items, [items]);
  return { items, filtered, filter, setFilter, unreadCount, markAllRead, markRead, timeAgo, loading };
}

export default useNotifications;
