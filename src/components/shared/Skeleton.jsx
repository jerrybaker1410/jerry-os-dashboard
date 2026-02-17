/**
 * Skeleton loading placeholders that match the dashboard layout.
 * Replace <LoadingSpinner> with these for a polished shimmer effect.
 */

function SkeletonPulse({ className = '' }) {
  return <div className={`animate-skeleton-pulse bg-elevated rounded ${className}`} />;
}

/** A single metric card skeleton */
export function SkeletonMetricCard() {
  return (
    <div className="bg-surface border border-border-default rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="h-5 w-5 rounded-md" />
      </div>
      <SkeletonPulse className="h-7 w-16" />
      <SkeletonPulse className="h-3 w-24" />
    </div>
  );
}

/** A list card skeleton (activity feed, sessions list, cron jobs) */
export function SkeletonListCard({ rows = 4, title = true }) {
  return (
    <div className="bg-surface border border-border-default rounded-lg">
      {title && (
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <SkeletonPulse className="h-4 w-28" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      )}
      <div className="divide-y divide-border-default">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <SkeletonPulse className="h-4 w-4 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-3.5 w-3/4" />
              <SkeletonPulse className="h-2.5 w-1/2" />
            </div>
            <SkeletonPulse className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A chart card skeleton */
export function SkeletonChart({ height = 'h-60' }) {
  return (
    <div className="bg-surface border border-border-default rounded-lg p-4 space-y-3">
      <SkeletonPulse className="h-4 w-32" />
      <div className={`flex items-end gap-1 ${height}`}>
        {Array.from({ length: 14 }).map((_, i) => (
          <SkeletonPulse
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** A table skeleton */
export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
      <div className="border-b border-border-default px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonPulse key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border-default">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonPulse key={j} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full Command Center skeleton */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-in">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkeletonListCard rows={5} />
        <SkeletonListCard rows={4} />
        <div className="space-y-4">
          <SkeletonChart height="h-20" />
          <SkeletonListCard rows={3} />
        </div>
      </div>
    </div>
  );
}

/** Task Queue page skeleton */
export function SkeletonTaskQueue() {
  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-9 flex-1 max-w-sm" />
        <SkeletonPulse className="h-9 w-64" />
      </div>
      <SkeletonTable rows={8} cols={7} />
    </div>
  );
}

/** Cost Analytics page skeleton */
export function SkeletonCostAnalytics() {
  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <SkeletonTable rows={4} cols={4} />
    </div>
  );
}

/** Sessions & Logs page skeleton */
export function SkeletonSessionsLogs() {
  return (
    <div className="space-y-4 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '500px' }}>
        <SkeletonListCard rows={8} />
        <div className="lg:col-span-2 space-y-4">
          <SkeletonPulse className="h-5 w-48" />
          <div className="bg-surface border border-border-default rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <SkeletonPulse className="h-2.5 w-12" />
                <SkeletonPulse className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <SkeletonPulse className="h-2.5 w-12" />
                <SkeletonPulse className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <SkeletonPulse className="h-2.5 w-12" />
                <SkeletonPulse className="h-4 w-24" />
              </div>
            </div>
          </div>
          <SkeletonChart height="h-48" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonPulse;
