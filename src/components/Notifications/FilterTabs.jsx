// src/components/Notifications/FilterTabs.jsx
export default function FilterTabs({ filter, setFilter, unreadCount }) {
    const tabs = [
      { key: "all", label: "All" },
      { key: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
      { key: "read", label: "Read" },
    ];
  
    return (
      <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3" role="tablist" aria-label="Filter notifications">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
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
    );
  }