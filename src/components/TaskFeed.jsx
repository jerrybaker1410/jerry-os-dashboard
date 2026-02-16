import { Clock, PlayCircle, CheckCircle2, XCircle, Timer, AlertCircle } from 'lucide-react';
import { timeAgo, cronToHuman, cn } from '../lib/utils';

function CronJobItem({ job }) {
  const isActive = job.state?.lastStatus === 'ok';
  const hasError = job.state?.consecutiveErrors > 0;
  const nextRun = job.state?.nextRunAtMs;
  const lastRun = job.state?.lastRunAtMs;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-jerry-700/30 last:border-0">
      <div className={cn(
        'mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
        job.enabled
          ? hasError ? 'bg-neon-red/10 text-neon-red' : 'bg-neon-green/10 text-neon-green'
          : 'bg-jerry-700/50 text-jerry-500'
      )}>
        {hasError ? <AlertCircle size={16} /> : job.enabled ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{job.name || job.id.slice(0, 8)}</span>
          {!job.enabled && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-jerry-700 text-jerry-400">disabled</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-jerry-400 font-mono">
            {cronToHuman(job.schedule?.expr)}
          </span>
          {job.agentId && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-purple/10 text-neon-purple">
              {job.agentId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {nextRun && (
            <span className="text-[11px] text-jerry-500 flex items-center gap-1">
              <Timer size={10} /> Next: {timeAgo(nextRun)}
            </span>
          )}
          {lastRun && (
            <span className="text-[11px] text-jerry-500 flex items-center gap-1">
              <Clock size={10} /> Last: {timeAgo(lastRun)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskFeed({ jobs }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8 text-jerry-500 text-sm">
        No cron jobs found
      </div>
    );
  }

  // Sort: enabled first, then by next run time
  const sorted = [...jobs].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    const aNext = a.state?.nextRunAtMs || Infinity;
    const bNext = b.state?.nextRunAtMs || Infinity;
    return aNext - bNext;
  });

  // Show first 10
  const visible = sorted.slice(0, 10);

  return (
    <div className="divide-y-0">
      {visible.map(job => (
        <CronJobItem key={job.id} job={job} />
      ))}
      {sorted.length > 10 && (
        <div className="text-center py-2 text-xs text-jerry-500">
          +{sorted.length - 10} more jobs
        </div>
      )}
    </div>
  );
}
