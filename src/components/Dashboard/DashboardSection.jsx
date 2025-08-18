import DashboardKPI from "./DashboardKPI";

export default function DashboardSection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-10 mb-4 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Dashboard</h2>
      <DashboardKPI contextId="default" />
    </section>
  );
}
