export default function DashboardSection() {
    return (
      <div className="h-full text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl text-center font-bold mb-8">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Analytics</h3>
              <p className="text-gray-300">View your performance metrics and insights.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Reports</h3>
              <p className="text-gray-300">Generate and view detailed reports.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Overview</h3>
              <p className="text-gray-300">Get a quick overview of your data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  