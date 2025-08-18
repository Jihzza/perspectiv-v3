// src/components/Dashboard/DashboardKPI.jsx
import SectionCard from "./SectionCard";
import KPIGrid from "./KPIGrid";
import { useMetrics } from "../../hooks/useMetrics";

export default function DashboardKPI({ contextId = "default", className = "" }) {
  const { metrics, loading } = useMetrics(contextId);

  return (
    <div className={className}>
      <SectionCard>
        {loading ? (
          <div className="text-white/70">Loading KPIs…</div>
        ) : (
          <KPIGrid metrics={metrics} />
        )}
      </SectionCard>
    </div>
  );
}