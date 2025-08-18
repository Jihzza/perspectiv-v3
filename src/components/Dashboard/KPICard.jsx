// src/components/Dashboard/KPICard.jsx
export default function KPICard({ title, value, tone = "text-white" }) {
    return (
      <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
        <div className={`text-3xl font-bold ${tone} mb-2`}>{value}</div>
        <div className="text-sm text-gray-300">{title}</div>
      </div>
    );
  }