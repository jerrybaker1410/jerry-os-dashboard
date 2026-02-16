import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function formatCost(cents) {
  if (cents == null) return '$0.00';
  const dollars = cents / 100;
  if (dollars < 0.01) return '<$0.01';
  if (dollars < 1) return `$${dollars.toFixed(2)}`;
  if (dollars < 100) return `$${dollars.toFixed(2)}`;
  return `$${dollars.toFixed(0)}`;
}

export function formatDollars(amount) {
  if (amount == null) return '$0.00';
  if (amount < 0.01) return '<$0.01';
  if (amount < 1) return `$${amount.toFixed(3)}`;
  if (amount < 100) return `$${amount.toFixed(2)}`;
  return `$${amount.toFixed(0)}`;
}

export function formatTokens(count) {
  if (count == null) return '0';
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1_000_000).toFixed(2)}M`;
}

export function formatDuration(startOrSeconds, end) {
  // Called with (startDate, endDate) or (seconds)
  let seconds;
  if (end !== undefined) {
    // Two Date objects — compute diff in seconds
    seconds = Math.round((new Date(end) - new Date(startOrSeconds)) / 1000);
  } else {
    seconds = startOrSeconds;
  }
  if (seconds == null || isNaN(seconds)) return '—';
  seconds = Math.abs(Math.round(seconds));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatRelativeTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatTimestamp(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isToday(d)) return `Today ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`;
  return format(d, 'MMM d, HH:mm');
}

export function formatPercent(value, total) {
  if (!total) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function truncate(str, maxLen = 60) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}
