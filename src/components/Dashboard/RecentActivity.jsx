// src/components/Dashboard/RecentActivity.jsx
import SectionCard from "./SectionCard";

export default function RecentActivity({ items = [] }) {
  return (
    <SectionCard title="Recent Activity">
      {items.length === 0 ? (
        <div className="text-gray-300">No recent activity to display.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-white/50" />
              <div className="text-sm text-white/90">{it}</div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}