import { useState } from 'react';
import { Users, Bot, Cpu, Activity, Zap, Clock, Search } from 'lucide-react';
import { useStatus, useSessions } from '../hooks/useOpenClaw';
import { formatTokens, timeAgo, cn } from '../lib/utils';

const agentColors = [
  'from-neon-green/20 to-neon-green/5 border-neon-green/20',
  'from-neon-blue/20 to-neon-blue/5 border-neon-blue/20',
  'from-neon-purple/20 to-neon-purple/5 border-neon-purple/20',
  'from-neon-orange/20 to-neon-orange/5 border-neon-orange/20',
  'from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/20',
  'from-neon-pink/20 to-neon-pink/5 border-neon-pink/20',
];

export default function AgentProfiles() {
  const { data: statusData, isLoading: statusLoading } = useStatus();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const [search, setSearch] = useState('');

  // Extract agent list from status data
  const heartbeatAgents = statusData?.heartbeat?.agents || [];
  const sessions = sessionsData?.sessions || [];

  // Build agent profiles from heartbeat data + session data
  const agentProfiles = heartbeatAgents.map((agent, i) => {
    // Find sessions for this agent
    const agentSessions = sessions.filter(s => {
      const parts = s.key.split(':');
      return parts[1] === agent.agentId;
    });

    const totalTokens = agentSessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);
    const lastActive = agentSessions.length > 0
      ? Math.min(...agentSessions.map(s => s.ageMs))
      : null;

    return {
      ...agent,
      sessions: agentSessions.length,
      totalTokens,
      lastActiveMs: lastActive,
      colorIndex: i,
    };
  });

  const filtered = agentProfiles.filter(a =>
    a.agentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-neon-cyan" size={24} />
            Agent Profiles
          </h2>
          <p className="text-sm text-jerry-400 mt-1">
            {heartbeatAgents.length} registered agents • {heartbeatAgents.filter(a => a.enabled).length} with heartbeat
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-jerry-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="pl-9 pr-3 py-2 rounded-lg bg-jerry-800/50 border border-jerry-600/30 text-sm text-white placeholder-jerry-500 focus:outline-none focus:border-neon-cyan/50 w-60"
          />
        </div>
      </div>

      {/* Agent Grid */}
      {statusLoading || sessionsLoading ? (
        <div className="text-center py-12 text-jerry-500">Loading agents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => {
            const colorSet = agentColors[agent.colorIndex % agentColors.length];
            return (
              <div
                key={agent.agentId}
                className={cn(
                  'card p-5 bg-gradient-to-br border transition-all duration-200 hover:scale-[1.01]',
                  colorSet
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-jerry-800/80 flex items-center justify-center">
                      <Bot size={20} className="text-jerry-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{agent.agentId}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          agent.enabled ? 'bg-neon-green pulse-dot' : 'bg-jerry-600'
                        )} />
                        <span className="text-[10px] text-jerry-400">
                          {agent.enabled ? `Heartbeat ${agent.every}` : 'Heartbeat disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-jerry-900/40 rounded-md px-2 py-2 text-center">
                    <Activity size={12} className="text-jerry-500 mx-auto mb-1" />
                    <div className="text-xs font-bold text-white">{agent.sessions}</div>
                    <div className="text-[9px] text-jerry-500">Sessions</div>
                  </div>
                  <div className="bg-jerry-900/40 rounded-md px-2 py-2 text-center">
                    <Zap size={12} className="text-jerry-500 mx-auto mb-1" />
                    <div className="text-xs font-bold text-white">{formatTokens(agent.totalTokens)}</div>
                    <div className="text-[9px] text-jerry-500">Tokens</div>
                  </div>
                  <div className="bg-jerry-900/40 rounded-md px-2 py-2 text-center">
                    <Clock size={12} className="text-jerry-500 mx-auto mb-1" />
                    <div className="text-xs font-bold text-white">
                      {agent.lastActiveMs !== null ? (agent.lastActiveMs < 60000 ? 'Now' : timeAgo(Date.now() - agent.lastActiveMs).replace(' ago', '')) : '—'}
                    </div>
                    <div className="text-[9px] text-jerry-500">Last Active</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!statusLoading && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Bot size={48} className="text-jerry-600 mx-auto mb-3" />
          <p className="text-jerry-400">No agents match your search</p>
        </div>
      )}
    </div>
  );
}
