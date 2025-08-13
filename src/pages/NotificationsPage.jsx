import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";

// Dummy notifications for now — swap with your backend later
const initialData = [
  {
    id: "n1",
    title: "Welcome to Galow!",
    body: "Thanks for joining. Here are a few tips to get started.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
    read: false,
    href: "/dashboard",
  },
  {
    id: "n2",
    title: "New follower",
    body: "Alex started following you.",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5h ago
    read: false,
    href: "/profile",
  },
  {
    id: "n3",
    title: "Weekly summary",
    body: "Your content got 1.2k views this week. Keep it up!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26h ago
    read: true,
    href: "/dashboard",
  },
];

function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialData);
  const [filter, setFilter] = useState("all"); // all | unread | read

  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((i) => !i.read);
    if (filter === "read") return items.filter((i) => i.read);
    return items;
  }, [items, filter]);

  const unreadCount = items.filter((i) => !i.read).length;

  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })));

  const openItem = (id) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    if (item.href) navigate(item.href);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Row */}
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6 mb-6">
            <div className="flex flex-col space-y-4 items-center justify-between">
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead} 
                  className="text-sm rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/25 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
                { key: "read", label: "Read" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    filter === key 
                      ? "bg-white/20 border-white/30 text-white" 
                      : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            <ul className="space-y-3">
              {filtered.length === 0 && (
                <li className="rounded-xl border border-white/20 p-8 text-center text-gray-300 bg-white/5">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-lg">You're all caught up!</p>
                  <p className="text-sm opacity-75">No new notifications at the moment.</p>
                </li>
              )}

              {filtered.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                    n.read 
                      ? "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30" 
                      : "border-[#33ccff]/30 bg-[#33ccff]/10 hover:bg-[#33ccff]/15 hover:border-[#33ccff]/50"
                  }`}
                  onClick={() => openItem(n.id)}
                >
                  {/* Unread dot */}
                  <span
                    className={`mt-2 inline-block w-3 h-3 rounded-full ${
                      n.read 
                        ? "bg-transparent border-2 border-white/20" 
                        : "bg-[#33ccff] border-2 border-[#33ccff]/50"
                    }`}
                    aria-hidden
                  />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold leading-tight text-lg">{n.title}</h3>
                      <time className="text-xs text-gray-400 whitespace-nowrap bg-black/20 px-2 py-1 rounded-full">
                        {timeAgo(n.createdAt)}
                      </time>
                    </div>
                    <p className="text-gray-200/90 mb-3">{n.body}</p>
                    {n.href && (
                      <Link
                        to={n.href}
                        className="inline-block text-sm text-[#33ccff] hover:text-[#33ccff]/80 transition-colors underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
