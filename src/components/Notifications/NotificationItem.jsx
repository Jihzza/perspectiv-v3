// src/components/Notifications/NotificationItem.jsx
import { Link } from "react-router-dom";

export default function NotificationItem({ n, onOpen, timeAgo }) {
  return (
    <li
      className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 flex items-start gap-3 ${
        n.read
          ? "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
          : "border-[#33ccff]/30 bg-[#33ccff]/10 hover:bg-[#33ccff]/15 hover:border-[#33ccff]/50"
      }`}
      onClick={() => onOpen?.(n)}
    >
      {/* Unread dot */}
      <span
        className={`mt-2 inline-block w-3 h-3 rounded-full ${
          n.read ? "bg-transparent border-2 border-white/20" : "bg-[#33ccff] border-2 border-[#33ccff]/50"
        }`}
        aria-hidden
      />

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-semibold leading-tight text-lg">{n.title}</h3>
          <time
            className="text-xs text-gray-400 whitespace-nowrap bg-black/20 px-2 py-1 rounded-full"
            dateTime={n.createdAt}
            title={new Date(n.createdAt).toLocaleString()}
          >
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
  );
}