import { Activity, Zap, DollarSign, Cpu } from 'lucide-react';
import { useDashboardData } from '../hooks/useOpenClawAPI';
import { useCostData } from '../hooks/useOpenRouterCosts';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/shared/MetricCard';
import StatusBadge from '../components/shared/StatusBadge';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { formatDollars, formatTokens, formatRelativeTime } from '../lib/formatters';
import { AGENTS } from '../lib/constants';

const statusDotColor = {
  active: 'bg-accent-green animate-pulse-green',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-500',
};

function AgentCard({ agent, stats }) {
  if (!stats) return null;
  const dotClass = statusDotColor[stats.status] || 'bg-gray-500';

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4 hover:border-border-hover transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg">{agent.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-primary truncate">{agent.name}</h3>
          <p className="text-xs text-text-muted">{agent.role}</p>
        </div>
        <span className={`w-2 h-2 rounded-full ${dotClass}`} title={stats.status} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-semibold text-text-primary font-data">{stats.tasksToday ?? 0}</p>
          <p className="text-[10px] text-text-muted">Tasks Today</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-text-primary font-data">{formatTokens(stats.tokensToday)}</p>
          <p className="text-[10px] text-text-muted">Tokens</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-text-primary font-data">{formatDollars(stats.costToday)}</p>
          <p className="text-[10px] text-text-muted">Cost Today</p>
        </div>
      </div>
      {stats.topTools && stats.topTools.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-default">
          <div className="flex flex-wrap gap-1">
            {stats.topTools.slice(0, 3).map((tool) => (
              <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-elevated text-text-muted">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ activities }) {
  const typeColors = {
    task_complete: 'text-accent-green',
    task_start: 'text-accent-blue',
    task_fail: 'text-accent-red',
    error: 'text-accent-red',
    session_start: 'text-accent-blue',
    session_end: 'text-text-muted',
    tool_call: 'text-accent-yellow',
    cost_alert: 'text-accent-red',
  };

  const typeIcons = {
    task_complete: '✓',
    task_start: '▶',
    task_fail: '✕',
    error: '✕',
    session_start: '◉',
    session_end: '◎',
    tool_call: '⚡',
    cost_alert: '$',
  };

  return (
    <div className="bg-surface border border-border-default rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <h3 className="text-sm font-medium text-text-primary">Recent Activity</h3>
        <span className="text-xs text-text-muted">{activities.length} events</span>
      </div>
      <div className="divide-y divide-border-default max-h-[400px] overflow-y-auto">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors">
            <span className={`text-xs mt-0.5 w-4 text-center ${typeColors[item.type] || 'text-text-muted'}`}>
              {typeIcons[item.type] || '•'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary leading-snug">{item.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-text-muted">{item.agent}</span>
                <span className="text-[10px] text-text-muted">·</span>
                <span className="text-[10px] text-text-muted">{formatRelativeTime(item.time)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostMiniChart({ dailyCosts }) {
  const last14 = dailyCosts.slice(-14);
  const maxCost = Math.max(...last14.map((d) => d.total), 0.01);

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">Daily Spend (14d)</h3>
        <DollarSign size={14} className="text-text-muted" />
      </div>
      <div className="flex items-end gap-1 h-20">
        {last14.map((day, i) => {
          const height = Math.max((day.total / maxCost) * 100, 4);
          const isToday = i === last14.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: $${day.total.toFixed(2)}`}>
              <div
                className={`w-full rounded-sm transition-all ${isToday ? 'bg-accent-blue' : 'bg-accent-blue/30'}`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-text-muted">{last14[0]?.date?.slice(5)}</span>
        <span className="text-[10px] text-text-muted">Today</span>
      </div>
    </div>
  );
}

function ActiveSessionsList({ sessions }) {
  const active = sessions.filter((s) => s.status === 'active' || s.status === 'running');

  return (
    <div className="bg-surface border border-border-default rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <h3 className="text-sm font-medium text-text-primary">Active Sessions</h3>
        <span className="text-xs text-text-muted">{active.length} running</span>
      </div>
      {active.length === 0 ? (
        <div className="p-6 text-center text-text-muted text-sm">No active sessions</div>
      ) : (
        <div className="divide-y divide-border-default">
          {active.map((session) => (
            <div key={session.id} className="flex items-center gap-3 px-4 py-3">
              <StatusBadge status={session.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{session.task}</p>
                <p className="text-xs text-text-muted">{session.agentName} · {session.model}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary font-data">{formatDollars(session.cost)}</p>
                <p className="text-[10px] text-text-muted">{formatRelativeTime(session.startedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommandCenter() {
  const { data, isLoading, error, refetch } = useDashboardData();
  const { data: costData } = useCostData();

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-accent-red p-4">Error loading dashboard: {error.message}</div>;

  const { sessions = [], tasks = [], agentStats = [], recentActivity = [] } = data || {};
  const costs = costData || data?.costs || {};

  // Build agentStats lookup by id (array → object)
  const agentStatsById = {};
  if (Array.isArray(agentStats)) {
    agentStats.forEach((a) => { agentStatsById[a.id] = a; });
  }

  const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'running').length;
  const runningTasks = tasks.filter((t) => t.status === 'running').length;
  const totalTokensToday = (Array.isArray(agentStats) ? agentStats : Object.values(agentStats))
    .reduce((sum, a) => sum + (a.tokensToday || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        subtitle="Multi-agent operations overview"
        onRefresh={refetch}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Sessions"
          value={activeSessions}
          subValue={`${sessions.length} total`}
          trend={activeSessions > 0 ? 'up' : 'neutral'}
          icon={Activity}
          accentColor="accent-green"
        />
        <MetricCard
          label="Running Tasks"
          value={runningTasks}
          subValue={`${tasks.filter((t) => t.status === 'queued').length} queued`}
          trend={runningTasks > 0 ? 'up' : 'neutral'}
          icon={Zap}
          accentColor="accent-blue"
        />
        <MetricCard
          label="Spend This Month"
          value={`$${formatDollars(costs.totalThisMonth)}`}
          subValue={`$${formatDollars(costs.avgDailyCost)}/day avg`}
          trend={costs.totalThisMonth > costs.totalLastMonth ? 'up' : 'down'}
          icon={DollarSign}
          accentColor="accent-yellow"
        />
        <MetricCard
          label="Tokens Today"
          value={formatTokens(totalTokensToday)}
          subValue="across all agents"
          icon={Cpu}
          accentColor="accent-blue"
        />
      </div>

      {/* Agent Grid */}
      <div>
        <h2 className="text-sm font-medium text-text-secondary mb-3">Agent Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(AGENTS).map(([key, agent]) => (
            <AgentCard key={key} agent={agent} stats={agentStatsById[agent.id]} />
          ))}
        </div>
      </div>

      {/* Bottom Row: Activity + Sessions + Cost Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ActivityFeed activities={recentActivity} />
        <ActiveSessionsList sessions={sessions} />
        <div className="space-y-4">
          <CostMiniChart dailyCosts={costs.dailyCosts || []} />
          <div className="bg-surface border border-border-default rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">Credit Balance</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold text-text-primary font-data">
                ${formatDollars(costs.creditBalance)}
              </span>
              <span className="text-xs text-text-muted mb-1">/ ${costs.creditLimit}</span>
            </div>
            <div className="mt-3 h-2 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-blue rounded-full transition-all"
                style={{ width: `${((costs.creditBalance || 0) / (costs.creditLimit || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
