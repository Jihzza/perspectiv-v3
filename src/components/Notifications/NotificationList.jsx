// src/components/Notifications/NotificationList.jsx
import NotificationItem from "./NotificationItem";

export default function NotificationList({ items = [], onOpen, timeAgo }) {
  return (
    <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
      <ul className="space-y-3">
        {items.length === 0 && (
          <li className="rounded-xl border border-white/20 p-8 text-center text-gray-300 bg-white/5">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-lg">You're all caught up!</p>
            <p className="text-sm opacity-75">No new notifications at the moment.</p>
          </li>
        )}
        {items.map((n) => (
          <NotificationItem key={n.id} n={n} onOpen={onOpen} timeAgo={timeAgo} />
        ))}
      </ul>
    </div>
  );
}