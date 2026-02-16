import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DollarSign, TrendingUp, Cpu, CreditCard } from 'lucide-react';
import { useCostData } from '../hooks/useOpenRouterCosts';
import { useDashboardData } from '../hooks/useOpenClawAPI';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/shared/MetricCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { formatDollars, formatTokens } from '../lib/formatters';
import { AGENTS } from '../lib/constants';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#eab308', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elevated border border-border-default rounded-md px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-data" style={{ color: entry.color }}>
          {entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
        </p>
      ))}
    </div>
  );
};

function DailySpendChart({ data, range }) {
  const slicedData = range === '7d' ? data.slice(-7) : range === '14d' ? data.slice(-14) : data;

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-primary">Daily Spend</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={slicedData}>
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
          <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#costGradient)" strokeWidth={2} name="Cost" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ModelBreakdownChart({ models }) {
  const chartData = models.map((m, i) => ({
    name: m.name,
    cost: m.totalCost,
    tokens: m.totalTokens,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Cost by Model</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#999', fontSize: 11 }} width={90} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cost" name="Cost" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AgentCostChart({ agentStats }) {
  // agentStats is an array
  const data = (Array.isArray(agentStats) ? agentStats : []).map((stats) => ({
    name: stats.name,
    value: stats.costThisMonth || 0,
    emoji: stats.emoji,
  })).filter((d) => d.value > 0);

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Monthly Cost by Agent</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-elevated border border-border-default rounded-md px-3 py-2 shadow-lg">
                  <p className="text-sm text-text-primary">{payload[0].name}</p>
                  <p className="text-sm font-data text-accent-blue">${payload[0].value.toFixed(2)}</p>
                </div>
              );
            }}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ModelTable({ models }) {
  return (
    <div className="bg-surface border border-border-default rounded-lg">
      <div className="p-4 border-b border-border-default">
        <h3 className="text-sm font-medium text-text-primary">Model Usage Details</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase">Model</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase">Requests</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase">Tokens</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase">Cost</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {models.map((model, i) => {
              const totalCost = models.reduce((s, m) => s + m.totalCost, 0);
              const pct = totalCost > 0 ? (model.totalCost / totalCost) * 100 : 0;
              return (
                <tr key={i} className="hover:bg-elevated/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-text-primary">{model.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-text-secondary font-data">{model.requests}</td>
                  <td className="px-4 py-3 text-right text-sm text-text-secondary font-data">{formatTokens(model.totalTokens)}</td>
                  <td className="px-4 py-3 text-right text-sm text-text-primary font-data">${formatDollars(model.totalCost)}</td>
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
  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const costs = costData || {};
  const agentStats = dashData?.agentStats || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Analytics"
        subtitle="OpenRouter spend tracking and optimization"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="This Month"
          value={`$${formatDollars(costs.totalThisMonth)}`}
          subValue={`vs $${formatDollars(costs.totalLastMonth)} last month`}
          trend={costs.totalThisMonth > costs.totalLastMonth ? 'up' : 'down'}
          icon={DollarSign}
          accentColor="accent-blue"
        />
        <MetricCard
          label="Daily Average"
          value={`$${formatDollars(costs.avgDailyCost)}`}
          subValue="per day"
          icon={TrendingUp}
          accentColor="accent-green"
        />
        <MetricCard
          label="Credit Balance"
          value={`$${formatDollars(costs.creditBalance)}`}
          subValue={`of $${costs.creditLimit} limit`}
          trend={(costs.creditBalance || 0) > 20 ? 'up' : 'down'}
          icon={CreditCard}
          accentColor="accent-yellow"
        />
        <MetricCard
          label="Top Model Cost"
          value={`$${formatDollars(costs.topModels?.[0]?.totalCost || 0)}`}
          subValue={costs.topModels?.[0]?.name || '—'}
          icon={Cpu}
          accentColor="accent-blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailySpendChart data={costs.dailyCosts || []} range={dateRange} />
        <ModelBreakdownChart models={costs.topModels || []} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ModelTable models={costs.topModels || []} />
        </div>
        <AgentCostChart agentStats={agentStats} />
      </div>
    </div>
  );
}
