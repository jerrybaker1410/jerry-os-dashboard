import { useState, useMemo } from 'react';
import {
  Users, Activity, Zap, Clock, Search, LayoutGrid, Network,
  X, Terminal, Brain, ChevronRight,
} from 'lucide-react';
import { useSessions } from '../hooks/useOpenClawAPI';
import PageHeader from '../components/layout/PageHeader';
import { SkeletonTable } from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { CopyValue } from '../components/shared/CopyButton';
import { formatTokens, formatRelativeTime } from '../lib/formatters';
import { AGENTS, AGENT_TEAMS } from '../lib/constants';

// ─── Agent Detail Drawer ────────────────────────────────────────

function AgentDetailDrawer({ agent, sessions, onClose }) {
  if (!agent) return null;

  const team = Object.values(AGENT_TEAMS).find((t) => t.id === agent.team);
  const agentSessions = sessions.filter((s) => {
    const parts = (s.key || '').split(':');
    return parts[1] === agent.id;
  });

  const activeSessions = agentSessions.filter((s) => s.ageMs != null && s.ageMs < 600000);
  const totalTokens = agentSessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);

  // Model breakdown
  const modelMap = {};
  agentSessions.forEach((s) => {
    if (s.model) {
      modelMap[s.model] = (modelMap[s.model] || 0) + 1;
    }
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-surface border-l border-border-default z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border-default px-5 py-4 flex items-center gap-3 z-10">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${agent.color}15` }}
          >
            {agent.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-text-primary truncate">{agent.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{agent.role}</span>
              {team && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${team.color}15`, color: team.color }}
                >
                  {team.label}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-elevated/50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold font-data text-text-primary">{agentSessions.length}</p>
              <p className="text-[10px] text-text-muted">Total Sessions</p>
            </div>
            <div className="bg-elevated/50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold font-data text-accent-green">{activeSessions.length}</p>
              <p className="text-[10px] text-text-muted">Active Now</p>
            </div>
            <div className="bg-elevated/50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold font-data text-text-primary">{formatTokens(totalTokens)}</p>
              <p className="text-[10px] text-text-muted">Total Tokens</p>
            </div>
            <div className="bg-elevated/50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold font-data text-text-primary">{Object.keys(modelMap).length}</p>
              <p className="text-[10px] text-text-muted">Models Used</p>
            </div>
          </div>

          {/* Agent Identity */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Identity</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Agent ID</span>
                <CopyValue text={agent.id} />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Team</span>
                <span className="text-xs text-text-secondary">{team?.label || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Models Breakdown */}
          {Object.keys(modelMap).length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Models</p>
              <div className="space-y-1.5">
                {Object.entries(modelMap)
                  .sort(([, a], [, b]) => b - a)
                  .map(([model, count]) => (
                    <div key={model} className="flex items-center justify-between py-1">
                      <CopyValue text={model} className="flex-1 truncate" />
                      <span className="text-xs text-text-muted font-data ml-2">{count} sess</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          {agentSessions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Recent Sessions</p>
              <div className="space-y-1">
                {agentSessions.slice(0, 10).map((s, i) => {
                  const keyParts = (s.key || '').split(':');
                  const sessionType = keyParts[2] || 'unknown';
                  const isActive = s.ageMs != null && s.ageMs < 600000;
                  return (
                    <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-elevated/50">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-accent-green animate-pulse' : 'bg-gray-600'}`} />
                      <span className="text-xs text-text-secondary flex-1 truncate">{sessionType}</span>
                      <span className="text-[10px] text-text-muted font-data">{s.model?.split('/').pop() || '—'}</span>
                      <span className="text-[10px] text-text-muted font-data">
                        {s.totalTokens ? formatTokens(s.totalTokens) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Org Chart View ─────────────────────────────────────────────

function OrgChartView({ agents, sessions, onSelectAgent }) {
  // Group by team
  const teamGroups = useMemo(() => {
    const groups = {};
    agents.forEach((agent) => {
      if (!groups[agent.team]) groups[agent.team] = [];
      groups[agent.team].push(agent);
    });
    return groups;
  }, [agents]);

  // Jerry (main) at the top
  const jerry = agents.find((a) => a.id === 'main');

  return (
    <div className="space-y-6">
      {/* Jerry at the top */}
      {jerry && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onSelectAgent(jerry)}
            className="bg-surface border-2 border-accent-blue/30 rounded-xl px-6 py-4 hover:border-accent-blue transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{jerry.emoji}</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors">{jerry.name}</p>
                <p className="text-[10px] text-text-muted">{jerry.role}</p>
              </div>
              <div className="ml-3 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${jerry.activeSessions > 0 ? 'bg-accent-green animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-[10px] text-text-muted font-data">{jerry.sessionCount} sess</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Connecting line */}
      <div className="flex justify-center">
        <div className="w-px h-6 bg-border-default" />
      </div>

      {/* Team sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(AGENT_TEAMS).map(([key, team]) => {
          const teamAgents = teamGroups[team.id] || [];
          if (teamAgents.length === 0) return null;
          // Skip core team's "main" agent since it's shown at top
          const displayAgents = team.id === 'core'
            ? teamAgents.filter((a) => a.id !== 'main')
            : teamAgents;
          if (displayAgents.length === 0) return null;

          return (
            <div key={key} className="bg-surface border border-border-default rounded-lg overflow-hidden">
              {/* Team header */}
              <div className="px-3 py-2 border-b border-border-default flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="text-xs font-medium text-text-primary">{team.label}</span>
                <span className="text-[10px] text-text-muted ml-auto font-data">{displayAgents.length}</span>
              </div>
              {/* Agent nodes */}
              <div className="divide-y divide-border-default">
                {displayAgents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => onSelectAgent(agent)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-elevated/50 transition-colors text-left group"
                  >
                    <span className="text-base">{agent.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">
                        {agent.name}
                      </p>
                      <p className="text-[9px] text-text-muted truncate">{agent.role}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {agent.activeSessions > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                      )}
                      <span className="text-[10px] text-text-muted font-data">{agent.sessionCount}</span>
                      <ChevronRight size={10} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Grid View (existing card layout) ───────────────────────────

function GridView({ agents, onSelectAgent }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => {
        const team = Object.values(AGENT_TEAMS).find((t) => t.id === agent.team);
        const isActive = agent.activeSessions > 0;

        return (
          <button
            key={agent.id}
            type="button"
            onClick={() => onSelectAgent(agent)}
            className="bg-surface border border-border-default rounded-lg p-5 hover:border-border-hover transition-all text-left group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${agent.color}15` }}
                >
                  {agent.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-accent-green animate-pulse-green' : 'bg-gray-600'
                      }`}
                    />
                    <span className="text-[10px] text-text-muted">{agent.role}</span>
                  </div>
                </div>
              </div>
              {team && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${team.color}15`, color: team.color }}
                >
                  {team.label}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-elevated rounded-md px-2 py-2 text-center">
                <Activity size={12} className="text-text-muted mx-auto mb-1" />
                <div className="text-xs font-semibold text-text-primary">{agent.sessionCount}</div>
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
                      : formatRelativeTime(new Date(Date.now() - agent.lastActiveMs).toISOString())
                    : '—'}
                </div>
                <div className="text-[9px] text-text-muted">Last Active</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════

export default function AgentProfiles() {
  const { data: sessions = [], isLoading, refetch } = useSessions();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [viewMode, setViewMode] = useState('org'); // 'grid' or 'org'
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Build agent profiles from the constants + live session data
  const agentProfiles = useMemo(() => {
    return Object.values(AGENTS).map((agent) => {
      const agentSessions = sessions.filter((s) => {
        const parts = (s.key || '').split(':');
        return parts[1] === agent.id;
      });

      const totalTokens = agentSessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);
      const activeSessions = agentSessions.filter((s) => s.ageMs != null && s.ageMs < 600000);
      const lastActiveMs = agentSessions.length > 0
        ? Math.min(...agentSessions.map((s) => s.ageMs ?? Infinity))
        : null;

      return {
        ...agent,
        sessionCount: agentSessions.length,
        activeSessions: activeSessions.length,
        totalTokens,
        lastActiveMs,
      };
    });
  }, [sessions]);

  const filtered = useMemo(() => {
    let list = agentProfiles;
    if (teamFilter !== 'all') {
      list = list.filter((a) => a.team === teamFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [agentProfiles, teamFilter, search]);

  const teams = ['all', ...Object.values(AGENT_TEAMS).map((t) => t.id)];
  const teamLabel = (id) => id === 'all' ? 'All' : AGENT_TEAMS[Object.keys(AGENT_TEAMS).find((k) => AGENT_TEAMS[k].id === id)]?.label || id;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agent Fleet"
        subtitle={`${Object.keys(AGENTS).length} agents across ${Object.keys(AGENT_TEAMS).length} teams`}
        onRefresh={refetch}
      />

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
            aria-label="Search agents"
          />
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border-default rounded-md p-0.5 overflow-x-auto">
          {teams.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTeamFilter(t)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                teamFilter === t
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {teamLabel(t)}
            </button>
          ))}
        </div>
        {/* View mode toggle */}
        <div className="flex items-center gap-0.5 bg-surface border border-border-default rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('org')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'org' ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-muted hover:text-text-secondary'}`}
            title="Org Chart"
          >
            <Network size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-muted hover:text-text-secondary'}`}
            title="Grid View"
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && <SkeletonTable rows={6} cols={6} />}

      {/* Content */}
      {!isLoading && filtered.length > 0 && (
        viewMode === 'org' ? (
          <OrgChartView
            agents={filtered}
            sessions={sessions}
            onSelectAgent={setSelectedAgent}
          />
        ) : (
          <GridView
            agents={filtered}
            onSelectAgent={setSelectedAgent}
          />
        )
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={Users}
          title="No agents found"
          subtitle={search ? `No agents matching "${search}"` : 'No agents in this team'}
        />
      )}

      {/* Detail Drawer */}
      {selectedAgent && (
        <AgentDetailDrawer
          agent={selectedAgent}
          sessions={sessions}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
