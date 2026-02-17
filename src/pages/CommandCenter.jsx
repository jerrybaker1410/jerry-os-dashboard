import { useMemo } from 'react';
import { Activity, Zap, DollarSign, Cpu, Link2Off, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, useActivity } from '../hooks/useOpenClawAPI';
import { useCostData } from '../hooks/useOpenRouterCosts';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/shared/MetricCard';
import { SkeletonDashboard } from '../components/shared/Skeleton';
import { CopyValue } from '../components/shared/CopyButton';
import { formatDollars, formatTokens, formatRelativeTime } from '../lib/formatters';
import { AGENTS, AGENT_TEAMS, COST_THRESHOLDS } from '../lib/constants';

// ─── Status Strip ─────────────────────────────────────────────

function StatusStrip({ sessions, cronJobs, costData, activityData }) {
  const activeSessions = sessions.filter((s) => s.ageMs != null && s.ageMs < 600000).length;
  const dailyCost = costData?.usageDaily || 0;
  const connected = costData?.connected;

  // Budget color
  let budgetColor = 'bg-accent-green';
  let budgetTextColor = 'text-accent-green';
  if (dailyCost >= COST_THRESHOLDS.critical) {
    budgetColor = 'bg-accent-red';
    budgetTextColor = 'text-accent-red';
  } else if (dailyCost >= COST_THRESHOLDS.warning) {
    budgetColor = 'bg-accent-yellow';
    budgetTextColor = 'text-accent-yellow';
  }

  const budgetPct = connected ? Math.min((dailyCost / COST_THRESHOLDS.critical) * 100, 100) : 0;

  // Last activity timestamp
  const lastActivity = activityData?.[0]?.time;

  return (
    <div className="bg-surface border border-border-default rounded-lg px-5 py-3 flex items-center gap-6 flex-wrap">
      {/* Gateway dot */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse" />
        <span className="text-xs text-text-secondary">Gateway Live</span>
      </div>

      <div className="w-px h-5 bg-border-default" />

      {/* Daily spend vs budget */}
      <div className="flex items-center gap-3 flex-1 min-w-[180px] max-w-xs">
        <span className="text-xs text-text-muted shrink-0">Daily Spend</span>
        <div className="flex-1">
          <div className="h-2 bg-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetColor}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
        <span className={`text-xs font-data font-semibold ${budgetTextColor}`}>
          {connected ? `$${formatDollars(dailyCost)}` : '—'}
        </span>
        <span className="text-[10px] text-text-muted">/ ${COST_THRESHOLDS.critical}</span>
      </div>

      <div className="w-px h-5 bg-border-default" />

      {/* Active sessions */}
      <div className="flex items-center gap-2">
        <Activity size={13} className="text-accent-green" />
        <span className="text-xs text-text-secondary">
          <span className="font-semibold font-data text-text-primary">{activeSessions}</span> active
        </span>
      </div>

      <div className="w-px h-5 bg-border-default" />

      {/* Last activity */}
      <div className="flex items-center gap-2 ml-auto">
        <Clock size={12} className="text-text-muted" />
        <span className="text-[11px] text-text-muted">
          {lastActivity ? formatRelativeTime(lastActivity) : 'No recent activity'}
        </span>
      </div>
    </div>
  );
}

// ─── Fleet Mini Status (23 agent dots) ─────────────────────────

function FleetMiniStatus({ sessions }) {
  const navigate = useNavigate();

  // Map sessions to active agent IDs
  const activeAgentIds = useMemo(() => {
    const ids = new Set();
    sessions.forEach((s) => {
      const parts = (s.key || '').split(':');
      if (parts[1]) ids.add(parts[1]);
    });
    return ids;
  }, [sessions]);

  // Group agents by team
  const teamGroups = useMemo(() => {
    const groups = {};
    Object.values(AGENTS).forEach((agent) => {
      if (!groups[agent.team]) groups[agent.team] = [];
      groups[agent.team].push(agent);
    });
    return groups;
  }, []);

  return (
    <div className="bg-surface border border-border-default rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <h3 className="text-sm font-medium text-text-primary">Fleet Status</h3>
        <button
          type="button"
          onClick={() => navigate('/agents')}
          className="text-[10px] text-accent-blue hover:underline"
        >
          View All →
        </button>
      </div>
      <div className="p-4 space-y-3">
        {Object.entries(AGENT_TEAMS).map(([key, team]) => {
          const agents = teamGroups[team.id] || [];
          if (agents.length === 0) return null;
          return (
            <div key={key}>
              <p className="text-[10px] text-text-muted mb-1.5">{team.label}</p>
              <div className="flex flex-wrap gap-2">
                {agents.map((agent) => {
                  const isActive = activeAgentIds.has(agent.id);
                  return (
                    <div
                      key={agent.id}
                      className="relative group cursor-default"
                      title={`${agent.emoji} ${agent.name} — ${agent.role}${isActive ? ' (active)' : ''}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] border transition-colors ${
                          isActive
                            ? 'border-accent-green/50 bg-accent-green/10'
                            : 'border-border-default bg-elevated/50'
                        }`}
                      >
                        {agent.emoji}
                      </div>
                      {isActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border-default px-4 py-2">
        <span className="text-[10px] text-text-muted">
          {activeAgentIds.size} of {Object.keys(AGENTS).length} agents active
        </span>
      </div>
    </div>
  );
}

// ─── Activity Feed (real data) ──────────────────────────────────

function ActivityFeed({ activities }) {
  const typeColors = {
    session: 'text-accent-blue',
    subagent: 'text-accent-green',
    cron_run: 'text-accent-yellow',
    cron_complete: 'text-accent-green',
    cron_scheduled: 'text-text-muted',
  };

  const typeIcons = {
    session: '◉',
    subagent: '◎',
    cron_run: '⚡',
    cron_complete: '✓',
    cron_scheduled: '⏰',
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-surface border border-border-default rounded-lg p-6 text-center">
        <Activity size={20} className="mx-auto text-text-muted mb-2" />
        <p className="text-sm text-text-muted">No recent activity</p>
      </div>
    );
  }

  // Group activities by time period
  const now = Date.now();
  const groups = { 'Last Hour': [], 'Last 4 Hours': [], 'Today': [], 'Earlier': [] };
  activities.forEach((item) => {
    const age = now - new Date(item.time).getTime();
    if (age < 3600000) groups['Last Hour'].push(item);
    else if (age < 14400000) groups['Last 4 Hours'].push(item);
    else if (age < 86400000) groups['Today'].push(item);
    else groups['Earlier'].push(item);
  });

  return (
    <div className="bg-surface border border-border-default rounded-lg lg:col-span-2">
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <h3 className="text-sm font-medium text-text-primary">Activity Feed</h3>
        <span className="text-xs text-text-muted">{activities.length} events</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {Object.entries(groups).map(([label, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={label}>
              <div className="px-4 py-1.5 bg-elevated/30 sticky top-0">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
              </div>
              <div className="divide-y divide-border-default">
                {items.map((item) => (
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
        })}
      </div>
    </div>
  );
}

// ─── Cost Mini Chart (from history snapshots) ───────────────────

function CostMiniChart({ snapshots }) {
  const last14 = (snapshots || []).slice(-14);

  if (last14.length === 0) {
    return (
      <div className="bg-surface border border-border-default rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-primary">Daily Spend (14d)</h3>
          <DollarSign size={14} className="text-text-muted" />
        </div>
        <div className="flex items-center justify-center h-20">
          <p className="text-xs text-text-muted">No history data yet</p>
        </div>
      </div>
    );
  }

  const maxCost = Math.max(...last14.map((d) => d.cost?.usageDaily || 0), 0.01);

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">Daily Spend (14d)</h3>
        <DollarSign size={14} className="text-text-muted" />
      </div>
      <div className="flex items-end gap-1 h-20">
        {last14.map((day, i) => {
          const cost = day.cost?.usageDaily || 0;
          const height = Math.max((cost / maxCost) * 100, 4);
          const isToday = i === last14.length - 1;
          const overBudget = cost >= COST_THRESHOLDS.critical;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${day.date}: $${cost.toFixed(2)}`}
            >
              <div
                className={`w-full rounded-sm transition-all ${
                  overBudget ? 'bg-accent-red' : isToday ? 'bg-accent-blue' : 'bg-accent-blue/30'
                }`}
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

// ─── Cron Jobs Overview ─────────────────────────────────────────

function CronJobsOverview({ cronJobs }) {
  const enabled = (cronJobs || []).filter((j) => j.enabled);
  const upcoming = enabled
    .filter((j) => j.state?.nextRunAtMs)
    .sort((a, b) => a.state.nextRunAtMs - b.state.nextRunAtMs)
    .slice(0, 5);

  // Map cron job agentId to agent name
  const getAgentLabel = (agentId) => {
    const agent = Object.values(AGENTS).find((a) => a.id === agentId);
    return agent ? `${agent.emoji} ${agent.name}` : agentId || 'system';
  };

  return (
    <div className="bg-surface border border-border-default rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <h3 className="text-sm font-medium text-text-primary">Upcoming Cron Jobs</h3>
        <span className="text-xs text-text-muted">{enabled.length} active</span>
      </div>
      {upcoming.length === 0 ? (
        <div className="p-6 text-center text-text-muted text-sm">No upcoming jobs</div>
      ) : (
        <div className="divide-y divide-border-default">
          {upcoming.map((job) => (
            <div key={job.id} className="flex items-center gap-3 px-4 py-3">
              <Clock size={14} className="text-accent-yellow shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{job.name}</p>
                <p className="text-xs text-text-muted">{getAgentLabel(job.agentId)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary font-data">
                  {formatRelativeTime(new Date(job.state.nextRunAtMs).toISOString())}
                </p>
                <p className="text-[10px] text-text-muted">{job.schedule?.expr}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OpenRouter Not Connected Banner ────────────────────────────

function ConnectOpenRouterBanner() {
  return (
    <div className="bg-surface border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
      <Link2Off size={18} className="text-yellow-500 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">Connect OpenRouter</p>
        <p className="text-xs text-text-muted">
          Add an OpenRouter API key to your OpenClaw config to see real cost data.
        </p>
      </div>
    </div>
  );
}

// ─── Model Usage Table ──────────────────────────────────────────

function ModelUsageTable({ sessions }) {
  const modelMap = {};
  (sessions || []).forEach((s) => {
    if (s.model) {
      if (!modelMap[s.model]) {
        modelMap[s.model] = { sessions: 0, tokens: 0 };
      }
      modelMap[s.model].sessions += 1;
      modelMap[s.model].tokens += s.totalTokens || 0;
    }
  });

  const models = Object.entries(modelMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.sessions - a.sessions);

  if (models.length === 0) return null;

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4">
      <h3 className="text-sm font-medium text-text-primary mb-3">Models in Use</h3>
      <div className="space-y-2">
        {models.map((m) => (
          <div key={m.name} className="flex items-center justify-between">
            <CopyValue text={m.name} className="flex-1 truncate" />
            <span className="text-xs text-text-muted font-data ml-2">{m.sessions} sess</span>
            <span className="text-xs text-text-muted font-data ml-2">{formatTokens(m.tokens)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════

export default function CommandCenter() {
  const { data, isLoading, error, refetch } = useDashboardData();
  const { data: costData } = useCostData();
  const { data: activityData } = useActivity();

  if (isLoading) return <SkeletonDashboard />;
  if (error) return <div className="text-accent-red p-4">Error loading dashboard: {error.message}</div>;

  const sessions = data?.sessions || [];
  const cronJobs = data?.cronJobs || [];
  const openrouterUsage = costData || data?.openrouterUsage || {};
  const historySnapshots = data?.historySnapshots || [];

  // Derived metrics
  const activeSessions = sessions.filter((s) => s.ageMs != null && s.ageMs < 600000).length;
  const totalTokens = sessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);
  const enabledCrons = cronJobs.filter((j) => j.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        subtitle="Real-time operations overview"
        onRefresh={refetch}
      />

      {/* Row 1: Status Strip */}
      <StatusStrip
        sessions={sessions}
        cronJobs={cronJobs}
        costData={openrouterUsage}
        activityData={activityData}
      />

      {/* OpenRouter connection check */}
      {!openrouterUsage?.connected && <ConnectOpenRouterBanner />}

      {/* Row 2: Metric Cards */}
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
          label="Cron Jobs"
          value={enabledCrons}
          subValue={`${cronJobs.length} total`}
          trend={enabledCrons > 0 ? 'up' : 'neutral'}
          icon={Zap}
          accentColor="accent-blue"
        />
        <MetricCard
          label="Daily Spend"
          value={openrouterUsage?.connected ? `$${formatDollars(openrouterUsage.usageDaily)}` : '—'}
          subValue={openrouterUsage?.connected ? `$${COST_THRESHOLDS.critical} budget` : 'Not connected'}
          icon={DollarSign}
          accentColor="accent-yellow"
        />
        <MetricCard
          label="Total Tokens"
          value={formatTokens(totalTokens)}
          subValue="across all sessions"
          icon={Cpu}
          accentColor="accent-blue"
        />
      </div>

      {/* Row 3: Activity Feed (2/3) + Fleet Mini Status (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ActivityFeed activities={activityData || []} />
        <FleetMiniStatus sessions={sessions} />
      </div>

      {/* Row 4: Crons + Cost Chart + OpenRouter/Models */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CronJobsOverview cronJobs={cronJobs} />
        <CostMiniChart snapshots={historySnapshots} />
        <div className="space-y-4">
          {openrouterUsage?.connected && (
            <div className="bg-surface border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary">OpenRouter Usage</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Total</span>
                  <span className="text-sm font-semibold text-text-primary font-data">
                    ${formatDollars(openrouterUsage.usage)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Monthly</span>
                  <span className="text-sm text-text-secondary font-data">
                    ${formatDollars(openrouterUsage.usageMonthly)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Weekly</span>
                  <span className="text-sm text-text-secondary font-data">
                    ${formatDollars(openrouterUsage.usageWeekly)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Today</span>
                  <span className="text-sm text-text-secondary font-data">
                    ${formatDollars(openrouterUsage.usageDaily)}
                  </span>
                </div>
              </div>
              {openrouterUsage.limit != null && (
                <div className="mt-3">
                  <div className="h-2 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-blue rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((openrouterUsage.usage || 0) / (openrouterUsage.limit || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    ${formatDollars(openrouterUsage.usage)} / ${formatDollars(openrouterUsage.limit)}
                  </p>
                </div>
              )}
            </div>
          )}
          <ModelUsageTable sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
