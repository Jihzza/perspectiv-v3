// src/pages/NotificationsPage.jsx
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import HeaderBar from "../components/Notifications/HeaderBar";
import FilterTabs from "../components/Notifications/FilterTabs";
import NotificationList from "../components/Notifications/NotificationList";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { filtered, filter, setFilter, unreadCount, markAllRead, markRead, timeAgo } = useNotifications();

  const openItem = (n) => {
    markRead(n.id);
    if (n.href) navigate(n.href);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <HeaderBar unreadCount={unreadCount} onMarkAllRead={markAllRead} />
          <FilterTabs filter={filter} setFilter={setFilter} unreadCount={unreadCount} />
          <NotificationList items={filtered} onOpen={openItem} timeAgo={timeAgo} />
        </div>
      </div>
    </div>
  );
}