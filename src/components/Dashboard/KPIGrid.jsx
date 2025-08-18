// src/components/Dashboard/KPIGrid.jsx
import KPICard from "./KPICard";

export default function KPIGrid({ metrics }) {
  const m = metrics || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KPICard title="Cost Reduction" value={`${m.cost_reduction ?? 0}%`} tone="text-blue-300" />
      <KPICard title="Productivity Increase" value={`${m.productivity_increase ?? 0}%`} tone="text-green-300" />
      <KPICard title="Errors Reduction" value={`${m.errors_reduction ?? 0}%`} tone="text-purple-300" />
    </div>
  );
}