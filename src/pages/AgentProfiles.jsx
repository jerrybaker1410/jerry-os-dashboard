import { useState } from 'react';
import { Users, Bot, Activity, Zap, Clock, Search } from 'lucide-react';
import { useStatus, useSessions } from '../hooks/useOpenClaw';
import { formatTokens, timeAgo } from '../lib/utils';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const agentAccents = [
  { border: 'border-accent-blue/30', bg: 'bg-accent-blue/5', dot: 'bg-accent-blue' },
  { border: 'border-accent-green/30', bg: 'bg-accent-green/5', dot: 'bg-accent-green' },
  { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', dot: 'bg-yellow-500' },
  { border: 'border-accent-red/30', bg: 'bg-accent-red/5', dot: 'bg-accent-red' },
  { border: 'border-purple-500/30', bg: 'bg-purple-500/5', dot: 'bg-purple-500' },
  { border: 'border-pink-500/30', bg: 'bg-pink-500/5', dot: 'bg-pink-500' },
];

export default function AgentProfiles() {
  const { data: statusData, isLoading: statusLoading } = useStatus();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const [search, setSearch] = useState('');

  const heartbeatAgents = statusData?.heartbeat?.agents || [];
  const sessions = sessionsData?.sessions || [];

  const agentProfiles = heartbeatAgents.map((agent, i) => {
    const agentSessions = sessions.filter((s) => {
      const parts = (s.key || '').split(':');
      return parts[1] === agent.agentId;
    });

    const totalTokens = agentSessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);
    const lastActive = agentSessions.length > 0
      ? Math.min(...agentSessions.map((s) => s.ageMs || Infinity))
      : null;

    return {
      ...agent,
      sessions: agentSessions.length,
      totalTokens,
      lastActiveMs: lastActive,
      colorIndex: i,
    };
  });

  const filtered = agentProfiles.filter((a) =>
    a.agentId.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = statusLoading || sessionsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Users className="text-accent-blue" size={22} />
            Agent Profiles
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {heartbeatAgents.length} registered agents · {heartbeatAgents.filter((a) => a.enabled).length} with heartbeat
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="pl-9 pr-3 py-2 rounded-md bg-surface border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors w-60"
          />
        </div>
      </div>

      {/* Agent Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => {
            const accent = agentAccents[agent.colorIndex % agentAccents.length];
            return (
              <div
                key={agent.agentId}
                className={`bg-surface border ${accent.border} rounded-lg p-5 hover:border-border-hover transition-all`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center">
                      <Bot size={20} className="text-text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{agent.agentId}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${agent.enabled ? accent.dot + ' animate-pulse-green' : 'bg-gray-600'}`} />
                        <span className="text-[10px] text-text-muted">
                          {agent.enabled ? `Heartbeat ${agent.every}` : 'Heartbeat disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-elevated rounded-md px-2 py-2 text-center">
                    <Activity size={12} className="text-text-muted mx-auto mb-1" />
                    <div className="text-xs font-semibold text-text-primary">{agent.sessions}</div>
                    <div className="text-[9px] text-text-muted">Sessions</div>
                  </div>
                  <div className="bg-elevated rounded-md px-2 py-2 text-center">
                    <Zap size={12} className="text-text-muted mx-auto mb-1" />
                    <div className="text-xs font-semibold text-text-primary">{formatTokens(agent.totalTokens)}</div>
                    <div className="text-[9px] text-text-muted">Tokens</div>
                  </div>
                  <div className="bg-elevated rounded-md px-2 py-2 text-center">
                    <Clock size={12} className="text-text-muted mx-auto mb-1" />
                    <div className="text-xs font-semibold text-text-primary">
                      {agent.lastActiveMs !== null && agent.lastActiveMs !== Infinity
                        ? agent.lastActiveMs < 60000
                          ? 'Now'
                          : timeAgo(Date.now() - agent.lastActiveMs).replace(' ago', '')
                        : '—'}
                    </div>
                    <div className="text-[9px] text-text-muted">Last Active</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-surface border border-border-default rounded-lg p-12 text-center">
          <Bot size={48} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No agents match your search</p>
        </div>
      )}
    </div>
  );
}
