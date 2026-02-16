import { Clock, Cpu, Zap, Hash } from 'lucide-react';
import Sparkline from './Sparkline';
import { classifySession, getSessionLabel, formatTokens, timeAgo, cn } from '../lib/utils';

const typeConfig = {
  main: { color: '#22c55e', bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/20', glow: 'glow-green' },
  subagent: { color: '#3b82f6', bg: 'bg-neon-blue/10', text: 'text-neon-blue', border: 'border-neon-blue/20', glow: 'glow-blue' },
  cron: { color: '#8b5cf6', bg: 'bg-neon-purple/10', text: 'text-neon-purple', border: 'border-neon-purple/20', glow: 'glow-purple' },
  other: { color: '#94a3b8', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', glow: '' },
};

export default function SessionCard({ session }) {
  const type = classifySession(session.key);
  const config = typeConfig[type];
  const label = getSessionLabel(session.key);
  const isActive = session.ageMs < 300000; // active within 5 min

  // Generate fake sparkline data from token counts for visual interest
  const totalT = session.totalTokens || 0;
  const sparkData = totalT > 0
    ? Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * totalT * 0.3 + totalT * 0.1 * i / 12))
    : [];

  return (
    <div className={cn('card p-4 transition-all duration-200', config.border, isActive && config.glow)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', isActive ? 'pulse-dot' : '', isActive ? 'bg-neon-green' : 'bg-jerry-500')} />
          <span className="text-sm font-semibold text-white truncate max-w-[160px]">{label}</span>
        </div>
        <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-full', config.bg, config.text)}>
          {type}
        </span>
      </div>

      {/* Model */}
      <div className="flex items-center gap-1.5 mb-2">
        <Cpu size={12} className="text-jerry-400" />
        <span className="text-xs font-mono text-jerry-300 truncate">
          {session.model || 'unknown'}
        </span>
      </div>

      {/* Tokens */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-jerry-800/50 rounded-md px-2 py-1.5">
          <div className="text-[10px] text-jerry-500 uppercase">Tokens</div>
          <div className="text-sm font-bold text-white tabular-nums">{formatTokens(session.totalTokens)}</div>
        </div>
        <div className="bg-jerry-800/50 rounded-md px-2 py-1.5">
          <div className="text-[10px] text-jerry-500 uppercase">Context</div>
          <div className="text-sm font-bold text-white tabular-nums">{formatTokens(session.contextTokens)}</div>
        </div>
      </div>

      {/* Sparkline */}
      {sparkData.length > 0 && (
        <div className="mb-2">
          <Sparkline data={sparkData} color={config.color} height={28} />
        </div>
      )}

      {/* Last active */}
      <div className="flex items-center gap-1.5">
        <Clock size={11} className="text-jerry-500" />
        <span className="text-[11px] text-jerry-400">{timeAgo(session.updatedAt)}</span>
      </div>
    </div>
  );
}
