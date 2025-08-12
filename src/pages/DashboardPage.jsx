// DashboardKPI.jsx
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON);

export default function DashboardKPI({ contextId = 'default' }) {
  const [m, setM] = useState({ cost_reduction: 0, productivity_increase: 0, errors_reduction: 0 });

  useEffect(() => {
    let cancelled = false;

    // initial fetch
    supabase.from('metrics').select('*').eq('context_id', contextId).maybeSingle()
      .then(({ data }) => { if (!cancelled && data) setM(data); });

    // subscribe to updates on that row
    const channel = supabase
      .channel('metrics-realtime') // channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'metrics', filter: `context_id=eq.${contextId}` },
        payload => setM(payload.new ?? payload.old)
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [contextId]);

  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <Box title="Cost Reduction" value={m.cost_reduction + '%'} />
      <Box title="Productivity Increase" value={m.productivity_increase + '%'} />
      <Box title="Errors Reduction" value={m.errors_reduction + '%'} />
    </div>
  );
}

function Box({ title, value }) {
  return (
    <div style={{ padding: 16, borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,.08)' }}>
      <div style={{ fontSize: 14, opacity: .7 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
