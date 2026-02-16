import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

function TokensPieChart({ sessions }) {
  const data = sessions
    .filter(s => s.totalTokens > 0)
    .map(s => {
      const parts = s.key.split(':');
      const type = s.key.includes(':cron:') ? 'Cron' : s.key.includes(':subagent:') ? 'Subagent' : 'Main';
      return {
        name: type,
        value: s.totalTokens,
        model: s.model || 'unknown',
      };
    });

  // Aggregate by type
  const agg = {};
  data.forEach(d => {
    if (!agg[d.name]) agg[d.name] = { name: d.name, value: 0 };
    agg[d.name].value += d.value;
  });
  const pieData = Object.values(agg).sort((a, b) => b.value - a.value);

  if (pieData.length === 0) return <div className="text-jerry-500 text-sm text-center py-8">No token data yet</div>;

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 140, height: 140 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {pieData.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-jerry-300">{d.name}</span>
            </div>
            <span className="text-xs font-mono text-white tabular-nums">
              {d.value >= 1000000 ? `${(d.value / 1000000).toFixed(1)}M` : d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}K` : d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelBreakdown({ sessions }) {
  const modelMap = {};
  sessions.forEach(s => {
    const model = s.model || 'unknown';
    if (!modelMap[model]) modelMap[model] = { tokens: 0, sessions: 0 };
    modelMap[model].tokens += s.totalTokens || 0;
    modelMap[model].sessions += 1;
  });

  const models = Object.entries(modelMap)
    .map(([name, data]) => ({ name: name.split('/').pop(), fullName: name, ...data }))
    .sort((a, b) => b.tokens - a.tokens);

  return (
    <div className="space-y-2">
      {models.map((m, i) => {
        const maxTokens = models[0].tokens || 1;
        const pct = Math.round((m.tokens / maxTokens) * 100);
        return (
          <div key={m.fullName}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-jerry-300 font-mono truncate max-w-[180px]">{m.name}</span>
              <span className="text-[10px] text-jerry-500">{m.sessions} sessions</span>
            </div>
            <div className="h-1.5 bg-jerry-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CostChart({ sessions }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-medium text-jerry-400 uppercase tracking-wider mb-3">Token Usage by Type</h4>
        <TokensPieChart sessions={sessions} />
      </div>
      <div>
        <h4 className="text-xs font-medium text-jerry-400 uppercase tracking-wider mb-3">Model Breakdown</h4>
        <ModelBreakdown sessions={sessions} />
      </div>
    </div>
  );
}
