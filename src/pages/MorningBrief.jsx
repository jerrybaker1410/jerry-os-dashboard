import { Sun, Activity, Clock, DollarSign, Zap, Calendar, Brain, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBrief } from '../hooks/useOpenClawAPI';
import PageHeader from '../components/layout/PageHeader';
import { SkeletonDashboard } from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { formatDollars, formatTokens, formatRelativeTime } from '../lib/formatters';
import { COST_THRESHOLDS } from '../lib/constants';

function MetricStrip({ label, value, icon: Icon, color = 'text-text-primary' }) {
  return (
    <div className="bg-surface border border-border-default rounded-lg px-4 py-3 flex items-center gap-3">
      <Icon size={16} className="text-text-muted shrink-0" />
      <div>
        <div className={`text-lg font-bold font-data ${color}`}>{value}</div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function CronRunRow({ run }) {
  const statusColor = run.result === 'ok' || run.result === 'unknown'
    ? 'text-accent-green' : 'text-accent-red';
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-elevated transition-colors">
      <span className={`w-2 h-2 rounded-full shrink-0 ${run.result === 'ok' || run.result === 'unknown' ? 'bg-accent-green' : 'bg-accent-red'}`} />
      <span className="text-sm text-text-primary flex-1 truncate">{run.name}</span>
      <span className="text-xs text-text-muted font-data">{run.agentId || '—'}</span>
      <span className={`text-xs font-data ${statusColor}`}>
        {run.result === 'unknown' ? 'ran' : run.result}
      </span>
      <span className="text-xs text-text-muted font-data">
        {formatRelativeTime(new Date(run.lastRunAt).toISOString())}
      </span>
    </div>
  );
}

function UpcomingCronRow({ cron }) {
  const timeUntil = cron.nextRunAt - Date.now();
  const hours = Math.floor(timeUntil / 3600000);
  const mins = Math.floor((timeUntil % 3600000) / 60000);
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-elevated transition-colors">
      <Clock size={12} className="text-text-muted shrink-0" />
      <span className="text-sm text-text-primary flex-1 truncate">{cron.name}</span>
      <span className="text-xs text-text-muted font-data">{cron.agentId || '—'}</span>
      <span className="text-xs text-accent-blue font-data">in {timeStr}</span>
    </div>
  );
}

export default function MorningBrief() {
  const { data, isLoading, refetch } = useBrief();
  const navigate = useNavigate();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) return (
    <div className="space-y-4">
      <PageHeader title="Morning Brief" subtitle="Loading..." />
      <SkeletonDashboard />
    </div>
  );

  if (!data) return (
    <div className="space-y-4">
      <PageHeader title="Morning Brief" onRefresh={refetch} />
      <EmptyState icon={Sun} title="No brief data" subtitle="Could not fetch morning brief from the API" />
    </div>
  );

  const costColor = data.costToday?.daily > COST_THRESHOLDS.critical
    ? 'text-accent-red'
    : data.costToday?.daily > COST_THRESHOLDS.warning
    ? 'text-accent-yellow'
    : 'text-accent-green';

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title={`${greeting()}, Demetri`}
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        onRefresh={refetch}
      />

      {/* Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricStrip label="Sessions (24h)" value={data.sessionsSince24h} icon={Activity} />
        <MetricStrip label="Cron Runs (24h)" value={data.cronRunsSince24h?.length || 0} icon={Calendar} />
        <MetricStrip label="Cost Today" value={formatDollars(data.costToday?.daily || 0)} icon={DollarSign} color={costColor} />
        <MetricStrip label="Tokens (24h)" value={formatTokens(data.totalTokens)} icon={Zap} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cron Results */}
        <div className="bg-surface border border-border-default rounded-lg">
          <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Overnight Cron Results</h2>
            <span className="text-xs text-text-muted font-data">{data.cronRunsSince24h?.length || 0} runs</span>
          </div>
          <div className="divide-y divide-border-default max-h-64 overflow-y-auto">
            {(!data.cronRunsSince24h || data.cronRunsSince24h.length === 0) ? (
              <p className="text-sm text-text-muted text-center py-6">No cron runs in the last 24h</p>
            ) : (
              data.cronRunsSince24h.map((run) => (
                <CronRunRow key={run.id} run={run} />
              ))
            )}
          </div>
        </div>

        {/* Upcoming Crons */}
        <div className="bg-surface border border-border-default rounded-lg">
          <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Upcoming Crons</h2>
            <span className="text-xs text-text-muted font-data">next 12h</span>
          </div>
          <div className="divide-y divide-border-default max-h-64 overflow-y-auto">
            {(!data.upcomingCrons || data.upcomingCrons.length === 0) ? (
              <p className="text-sm text-text-muted text-center py-6">No upcoming crons</p>
            ) : (
              data.upcomingCrons.map((cron) => (
                <UpcomingCronRow key={cron.id} cron={cron} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      {data.costToday && (
        <div className="bg-surface border border-border-default rounded-lg p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Cost Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Today</div>
              <div className={`text-lg font-bold font-data ${costColor}`}>{formatDollars(data.costToday.daily)}</div>
              <div className="w-full h-1.5 bg-elevated rounded-full mt-1.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.costToday.daily > COST_THRESHOLDS.critical ? 'bg-accent-red' :
                    data.costToday.daily > COST_THRESHOLDS.warning ? 'bg-accent-yellow' : 'bg-accent-green'
                  }`}
                  style={{ width: `${Math.min((data.costToday.daily / COST_THRESHOLDS.critical) * 100, 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-text-muted mt-0.5">Budget: {formatDollars(COST_THRESHOLDS.critical)}/day</div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">This Week</div>
              <div className="text-lg font-bold font-data text-text-primary">{formatDollars(data.costToday.weekly)}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">This Month</div>
              <div className="text-lg font-bold font-data text-text-primary">{formatDollars(data.costToday.monthly)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Cron Operations', path: '/tasks', icon: Calendar },
          { label: 'Agent Fleet', path: '/agents', icon: Activity },
          { label: 'Memory Browser', path: '/memory', icon: Brain },
          { label: 'System Health', path: '/health', icon: Target },
        ].map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => navigate(link.path)}
            className="flex items-center gap-2 bg-surface border border-border-default rounded-lg px-4 py-3 hover:border-border-hover transition-colors group text-left"
          >
            <link.icon size={14} className="text-text-muted" />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1">{link.label}</span>
            <ChevronRight size={12} className="text-text-muted opacity-0 group-hover:opacity-50 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Fleet Summary */}
      <div className="bg-surface border border-border-default rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text-primary">Fleet Status</h2>
          <span className="text-xs text-text-muted font-data">{data.enabledCronJobs}/{data.totalCronJobs} crons enabled</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-secondary">
            <span className="text-accent-green font-bold font-data">{data.activeSessions}</span> active sessions
          </span>
          <span className="text-text-muted">·</span>
          <span className="text-text-secondary">
            <span className="font-bold font-data text-text-primary">{data.sessionsSince24h}</span> sessions in 24h
          </span>
          <span className="text-text-muted">·</span>
          <span className="text-text-secondary">
            <span className="font-bold font-data text-text-primary">{data.upcomingCrons?.length || 0}</span> crons upcoming
          </span>
        </div>
      </div>
    </div>
  );
}
