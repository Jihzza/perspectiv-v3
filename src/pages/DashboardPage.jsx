import DashboardKPI from "../components/Dashboard/DashboardKPI";

export default function DashboardPage() {
  return (
    <div className="h-full text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        <div className="max-w-4xl space-y-6">
          {/* Shared KPI widget */}
          <DashboardKPI contextId="default" />

          {/* Additional Dashboard Content */}
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="text-gray-300">
              <p>No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
