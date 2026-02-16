import { STATUS_COLORS } from '../../lib/constants';

export default function StatusBadge({ status, size = 'sm' }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.queued;
  const isRunning = status === 'running';

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${isRunning ? 'animate-pulse-green' : ''}`} />
      {status}
    </span>
  );
}
