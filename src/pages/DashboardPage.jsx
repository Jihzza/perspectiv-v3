// src/pages/DashboardPage.jsx
import DashboardKPI from "../components/Dashboard/DashboardKPI";
import RecentActivity from "../components/Dashboard/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="text-white grid place-items-start h-[calc(100dvh-theme(spacing.16)-theme(spacing.16))]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        <div className="max-w-5xl space-y-6">
          <DashboardKPI contextId="default" />
          <RecentActivity items={[]} />
        </div>
      </div>
    </div>
  );
}