// place next to DashboardPage.jsx (adjust the import path if your folders differ)
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardKPI({ contextId = "default", className = "" }) {
  const [m, setM] = useState({
    cost_reduction: 0,
    productivity_increase: 0,
    errors_reduction: 0,
  });

  useEffect(() => {
    let cancelled = false;

    // initial fetch
    supabase
      .from("metrics")
      .select("*")
      .eq("context_id", contextId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setM(data);
      });

    // realtime updates
    const channel = supabase
      .channel("metrics-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "metrics", filter: `context_id=eq.${contextId}` },
        (payload) => setM(payload.new ?? payload.old)
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [contextId]);

  return (
    <div className={className}>
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6 text-white">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard title="Cost Reduction" value={`${m.cost_reduction ?? 0}%`} color="text-blue-300" />
          <KPICard title="Productivity Increase" value={`${m.productivity_increase ?? 0}%`} color="text-green-300" />
          <KPICard title="Errors Reduction" value={`${m.errors_reduction ?? 0}%`} color="text-purple-300" />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, color }) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="text-sm text-gray-300">{title}</div>
    </div>
  );
}
