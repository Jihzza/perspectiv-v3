// src/components/Notifications/HeaderBar.jsx
export default function HeaderBar({ unreadCount, onMarkAllRead }) {
    return (
      <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6 mb-6">
        <div className="flex flex-col space-y-4 items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-sm rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/25 transition-colors"
              aria-label="Mark all notifications as read"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>
    );
  }