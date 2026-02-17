import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Cpu, Link2Off } from 'lucide-react';
import { useCostData } from '../hooks/useOpenRouterCosts';
import { useDashboardData } from '../hooks/useOpenClawAPI';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/shared/MetricCard';
import { SkeletonCostAnalytics } from '../components/shared/Skeleton';
import { CopyValue } from '../components/shared/CopyButton';
import { formatDollars, formatTokens } from '../lib/formatters';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#eab308', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elevated border border-border-default rounded-md px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-data" style={{ color: entry.color }}>
          {entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

function DailySpendChart({ snapshots, range }) {
  const sliced = range === '7d' ? snapshots.slice(-7) : range === '14d' ? snapshots.slice(-14) : snapshots;

  const data = sliced.map((s) => ({
    date: s.date,
    daily: s.cost?.usageDaily || 0,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border-default rounded-lg p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Daily Spend</h3>
        <div className="flex items-center justify-center h-60">
          <p className="text-sm text-text-muted">No history data. Run <code className="bg-elevated px-1 rounded">history-logger.js</code> to populate charts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Daily Spend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="daily" stroke="#3b82f6" fill="url(#costGradient)" strokeWidth={2} name="Daily Cost" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SessionsOverTimeChart({ snapshots, range }) {
  const sliced = range === '7d' ? snapshots.slice(-7) : range === '14d' ? snapshots.slice(-14) : snapshots;

  const data = sliced.map((s) => ({
    date: s.date,
    sessions: s.sessions?.total || 0,
    cron: s.sessions?.cron || 0,
    subagent: s.sessions?.subagent || 0,
  }));

  if (data.length === 0) return null;

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Sessions Over Time</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={{ fill: '#666', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="sessions" name="Total Sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ModelUsageFromSessions({ sessions }) {
  const modelMap = {};
  (sessions || []).forEach((s) => {
    if (s.model) {
      if (!modelMap[s.model]) {
        modelMap[s.model] = { name: s.model, sessions: 0, tokens: 0 };
      }
      modelMap[s.model].sessions += 1;
      modelMap[s.model].tokens += s.totalTokens || 0;
    }
  });

  const models = Object.values(modelMap).sort((a, b) => b.sessions - a.sessions);

  if (models.length === 0) {
    return (
      <div className="bg-surface border border-border-default rounded-lg p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Model Usage</h3>
        <p className="text-sm text-text-muted text-center py-6">No session data available</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-default rounded-lg">
      <div className="p-4 border-b border-border-default">
        <h3 className="text-sm font-medium text-text-primary">Model Usage (Current Sessions)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase">Model</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase">Sessions</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase">Tokens</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase">% of Sessions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {models.map((model, i) => {
              const totalSessions = models.reduce((s, m) => s + m.sessions, 0);
              const pct = totalSessions > 0 ? (model.sessions / totalSessions) * 100 : 0;
              return (
                <tr key={i} className="hover:bg-elevated/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <CopyValue text={model.name} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-text-secondary font-data">{model.sessions}</td>
                  <td className="px-4 py-3 text-right text-sm text-text-secondary font-data">{formatTokens(model.tokens)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                      <span className="text-xs text-text-muted font-data w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CostAnalytics() {
  const { data: costData, isLoading: costLoading, refetch: refetchCost } = useCostData();
  const { data: dashData, isLoading: dashLoading } = useDashboardData();
  const [dateRange, setDateRange] = useState('30d');

  const isLoading = costLoading || dashLoading;
  if (isLoading) return <SkeletonCostAnalytics />;

  const costs = costData || {};
  const sessions = dashData?.sessions || [];
  const historySnapshots = dashData?.historySnapshots || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Analytics"
        subtitle="OpenRouter spend tracking"
        onRefresh={refetchCost}
        actions={
          <div className="flex items-center gap-1 bg-surface border border-border-default rounded-md p-0.5">
            {['7d', '14d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {/* Not connected banner */}
      {!costs.connected && (
        <div className="bg-surface border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
          <Link2Off size={18} className="text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-primary">Connect OpenRouter</p>
            <p className="text-xs text-text-muted">
              Add an OpenRouter API key to your OpenClaw config to see real cost data.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="This Month"
          value={costs.connected ? `$${formatDollars(costs.usageMonthly)}` : '—'}
          subValue={costs.connected ? 'OpenRouter usage' : 'Not connected'}
          icon={DollarSign}
          accentColor="accent-blue"
        />
        <MetricCard
          label="Today"
          value={costs.connected ? `$${formatDollars(costs.usageDaily)}` : '—'}
          subValue="daily spend"
          icon={TrendingUp}
          accentColor="accent-green"
        />
        <MetricCard
          label="This Week"
          value={costs.connected ? `$${formatDollars(costs.usageWeekly)}` : '—'}
          subValue="weekly spend"
          icon={DollarSign}
          accentColor="accent-yellow"
        />
        <MetricCard
          label="All Time"
          value={costs.connected ? `$${formatDollars(costs.usage)}` : '—'}
          subValue={costs.limit ? `of $${formatDollars(costs.limit)} limit` : 'total usage'}
          icon={Cpu}
          accentColor="accent-blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailySpendChart snapshots={historySnapshots} range={dateRange} />
        <SessionsOverTimeChart snapshots={historySnapshots} range={dateRange} />
      </div>

      {/* Model Table */}
      <ModelUsageFromSessions sessions={sessions} />
    </div>
  );
}
