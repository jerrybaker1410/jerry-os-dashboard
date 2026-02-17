import { useState, useMemo } from 'react';
import { Clock, Play, Pause, CheckCircle, XCircle, ChevronDown, ChevronRight, Search, Timer, Calendar } from 'lucide-react';
import { useTaskQueue, useCronRuns } from '../hooks/useOpenClawAPI';
import { useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/layout/PageHeader';
import { SkeletonTable } from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { useToast } from '../components/shared/Toast';
import { CopyValue } from '../components/shared/CopyButton';
import { formatRelativeTime, formatDuration } from '../lib/formatters';
import { toggleCronJob, triggerCronJob } from '../lib/api';

function CronMetricCard({ label, value, subValue, icon: Icon, color = 'text-text-primary' }) {
  return (
    <div className="bg-surface border border-border-default rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-text-muted" />
        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl font-bold font-data ${color}`}>{value}</div>
      {subValue && <div className="text-[10px] text-text-muted mt-0.5">{subValue}</div>}
    </div>
  );
}

function CronRunHistory({ jobId }) {
  const { data: runs = [], isLoading } = useCronRuns(jobId, 10);

  if (isLoading) return <div className="px-4 py-3 text-xs text-text-muted">Loading run history…</div>;
  if (runs.length === 0) return <div className="px-4 py-3 text-xs text-text-muted">No run history available</div>;

  return (
    <div className="px-4 pb-3">
      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Recent Runs</p>
      <div className="space-y-1">
        {runs.map((run, i) => (
          <div key={i} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded hover:bg-elevated/50">
            {run.status === 'ok' || run.action === 'finished' ? (
              <CheckCircle size={12} className="text-accent-green shrink-0" />
            ) : (
              <XCircle size={12} className="text-accent-red shrink-0" />
            )}
            <span className="text-text-secondary w-32 shrink-0">
              {run.runAtMs ? new Date(run.runAtMs).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : formatRelativeTime(run.runAt || run.startedAt)}
            </span>
            {run.durationMs && <span className="text-text-muted font-data w-16 shrink-0">{formatDuration(run.durationMs / 1000)}</span>}
            <span className={`font-medium ${run.status === 'ok' ? 'text-accent-green' : run.status === 'error' ? 'text-accent-red' : 'text-text-muted'}`}>
              {run.action || run.status || '—'}
            </span>
            {run.summary && (
              <span className="text-text-muted truncate flex-1" title={run.summary}>
                {run.summary.slice(0, 80)}
              </span>
            )}
            {run.sessionId && <CopyValue text={run.sessionId} display={run.sessionId.slice(0, 8)} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CronOperations() {
  const { data: cronJobs = [], isLoading, refetch } = useTaskQueue();
  const [search, setSearch] = useState('');
  const [expandedJob, setExpandedJob] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const metrics = useMemo(() => {
    const enabled = cronJobs.filter((j) => j.enabled);
    const ranToday = cronJobs.filter((j) => {
      if (!j.state?.lastRunAtMs) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return j.state.lastRunAtMs >= today.getTime();
    });
    const failedToday = ranToday.filter((j) => j.state?.lastResult === 'error' || j.state?.lastResult === 'fail');

    return {
      total: cronJobs.length,
      enabled: enabled.length,
      ranToday: ranToday.length,
      failedToday: failedToday.length,
    };
  }, [cronJobs]);

  const filtered = useMemo(() => {
    let list = cronJobs;
    if (statusFilter === 'enabled') list = list.filter((j) => j.enabled);
    if (statusFilter === 'disabled') list = list.filter((j) => !j.enabled);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((j) =>
        j.name.toLowerCase().includes(q) || (j.agentId || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [cronJobs, statusFilter, search]);

  if (isLoading) return <SkeletonTable rows={8} cols={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cron Operations"
        subtitle={`${cronJobs.length} cron jobs configured`}
        onRefresh={refetch}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CronMetricCard label="Total Crons" value={metrics.total} icon={Calendar} />
        <CronMetricCard label="Enabled" value={metrics.enabled} subValue={`${metrics.total - metrics.enabled} disabled`} icon={Play} color="text-accent-green" />
        <CronMetricCard label="Ran Today" value={metrics.ranToday} icon={Timer} color="text-accent-blue" />
        <CronMetricCard label="Failed Today" value={metrics.failedToday} icon={XCircle} color={metrics.failedToday > 0 ? 'text-accent-red' : 'text-text-muted'} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cron jobs..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
            aria-label="Search cron jobs"
          />
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border-default rounded-md p-0.5">
          {['all', 'enabled', 'disabled'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Cron Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No cron jobs found" subtitle={search ? `No results for "${search}"` : 'No cron jobs configured'} />
      ) : (
        <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="divide-y divide-border-default">
            {filtered.map((job) => {
              const isExpanded = expandedJob === job.id;
              const lastRun = job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toISOString() : null;
              const nextRun = job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toISOString() : null;

              return (
                <div key={job.id}>
                  <button
                    type="button"
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-elevated/50 transition-colors text-left"
                    onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-text-muted shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-text-muted shrink-0" />
                    )}
                    <div className={`w-2 h-2 rounded-full shrink-0 ${job.enabled ? 'bg-accent-green' : 'bg-gray-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{job.name}</p>
                      <p className="text-[10px] text-text-muted">{job.agentId || 'default'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-secondary font-data">{job.schedule?.expr}</p>
                      <p className="text-[10px] text-text-muted">{job.schedule?.tz}</p>
                    </div>
                    <div className="text-right shrink-0 w-24">
                      <p className="text-[10px] text-text-muted">Last run</p>
                      <p className="text-xs text-text-secondary">{lastRun ? formatRelativeTime(lastRun) : '—'}</p>
                    </div>
                    <div className="text-right shrink-0 w-24">
                      <p className="text-[10px] text-text-muted">Next run</p>
                      <p className="text-xs text-text-secondary">{nextRun ? formatRelativeTime(nextRun) : '—'}</p>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border-default bg-elevated/30">
                      <CronRunHistory jobId={job.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t border-border-default px-4 py-2">
            <span className="text-xs text-text-muted">{filtered.length} of {cronJobs.length} cron jobs</span>
          </div>
        </div>
      )}
    </div>
  );
}
