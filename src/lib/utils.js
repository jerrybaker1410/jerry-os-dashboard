import { formatDistanceToNow, format, formatDistance } from 'date-fns';

export function timeAgo(ms) {
  if (!ms) return 'never';
  return formatDistanceToNow(new Date(ms), { addSuffix: true });
}

export function formatTime(ms) {
  if (!ms) return '—';
  return format(new Date(ms), 'MMM d, h:mm a');
}

export function formatDuration(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function formatTokens(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function classifySession(key) {
  if (key.includes(':cron:')) return 'cron';
  if (key.includes(':subagent:')) return 'subagent';
  if (key.endsWith(':main')) return 'main';
  return 'other';
}

export function getSessionAgent(key) {
  // agent:main:main -> main
  // agent:main:subagent:uuid -> subagent
  // agent:main:cron:uuid -> cron
  const parts = key.split(':');
  return parts[1] || 'unknown';
}

export function getSessionLabel(key) {
  const type = classifySession(key);
  const parts = key.split(':');
  if (type === 'main') return 'Main Session';
  if (type === 'subagent') return `Subagent ${parts[3]?.slice(0, 8) || ''}`;
  if (type === 'cron') {
    if (parts.length > 4) return `Cron Run ${parts[5]?.slice(0, 8) || ''}`;
    return `Cron ${parts[3]?.slice(0, 8) || ''}`;
  }
  return key;
}

export function statusColor(type) {
  switch (type) {
    case 'main': return 'text-neon-green';
    case 'subagent': return 'text-neon-blue';
    case 'cron': return 'text-neon-purple';
    default: return 'text-slate-400';
  }
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function cronToHuman(expr) {
  if (!expr) return '—';
  const parts = expr.split(' ');
  if (parts.length !== 5) return expr;
  const [min, hour, dom, mon, dow] = parts;

  const dowNames = { '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat' };
  const dowRange = { '1-5': 'Weekdays', '0-6': 'Daily', '*': 'Daily' };

  let schedule = '';
  if (dowRange[dow]) {
    schedule = dowRange[dow];
  } else if (dow.includes(',')) {
    schedule = dow.split(',').map(d => dowNames[d] || d).join('/');
  } else {
    schedule = dowNames[dow] || dow;
  }

  if (hour === '*') {
    schedule += ' every hour';
    if (min !== '0') schedule += ` at :${min.padStart(2, '0')}`;
  } else if (hour.includes(',')) {
    schedule += ` at ${hour.split(',').map(h => `${h}:${min.padStart(2, '0')}`).join(', ')}`;
  } else {
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    schedule += ` ${h12}:${min.padStart(2, '0')} ${ampm}`;
  }

  return schedule;
}
