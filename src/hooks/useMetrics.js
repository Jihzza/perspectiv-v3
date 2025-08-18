// src/hooks/useMetrics.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const EMPTY = { cost_reduction: 0, productivity_increase: 0, errors_reduction: 0 };

export function useMetrics(contextId = "default") {
  const [metrics, setMetrics] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchInitial() {
      setLoading(true);
      const { data, error } = await supabase
        .from("metrics")
        .select("cost_reduction, productivity_increase, errors_reduction, context_id")
        .eq("context_id", contextId)
        .maybeSingle();

      if (!cancelled) {
        if (error) setError(error);
        if (data) setMetrics(data);
        setLoading(false);
      }
    }

    fetchInitial();

    const channel = supabase
      .channel(`metrics:${contextId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "metrics", filter: `context_id=eq.${contextId}` },
        (payload) => {
          const row = payload.new ?? payload.old;
          if (!cancelled && row) {
            setMetrics((prev) => ({ ...prev, ...row }));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [contextId]);

  return { metrics, loading, error };
}