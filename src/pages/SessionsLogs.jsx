import { useState, useRef, useEffect } from 'react';
import { Terminal, X, ChevronRight } from 'lucide-react';
import { useSessions, useSessionLogs } from '../hooks/useOpenClawAPI';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import SkeletonPulse from '../components/shared/Skeleton';
import { SkeletonSessionsLogs } from '../components/shared/Skeleton';
import { CopyValue } from '../components/shared/CopyButton';
import EmptyState from '../components/shared/EmptyState';
import { formatDollars, formatTokens, formatRelativeTime, formatTimestamp, formatDuration } from '../lib/formatters';
import { AGENTS } from '../lib/constants';

const levelColors = {
  info: 'text-accent-blue',
  debug: 'text-text-muted',
  warn: 'text-accent-yellow',
  error: 'text-accent-red',
};

function SessionRow({ session, isSelected, onSelect }) {
  const agent = Object.values(AGENTS).find((a) => a.id === session.agent);

  return (
    <button
      onClick={() => onSelect(session.id)}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
        isSelected
          ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue'
          : 'hover:bg-elevated/50 border-l-2 border-l-transparent'
      }`}
    >
      <span className="text-sm">{agent?.emoji || '🤖'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">{session.task}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-text-muted">{session.agentName}</span>
          <span className="text-[10px] text-text-muted">·</span>
          <span className="text-[10px] text-text-muted">{formatRelativeTime(session.startedAt)}</span>
        </div>
      </div>
      <StatusBadge status={session.status} />
      <ChevronRight size={14} className="text-text-muted" />
    </button>
  );
}

function SessionDetail({ session }) {
  const agent = Object.values(AGENTS).find((a) => a.id === session.agent);
  const duration = session.endedAt
    ? formatDuration(session.startedAt, session.endedAt)
    : 'In progress';

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-surface border border-border-default rounded-lg">
      <div>
        <p className="text-[10px] text-text-muted uppercase mb-1">Agent</p>
        <div className="flex items-center gap-2">
          <span className="text-sm">{agent?.emoji || '🤖'}</span>
          <div>
            <p className="text-sm text-text-primary">{session.agentName}</p>
            <p className="text-[10px] text-text-muted">{agent?.role || ''}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-text-muted uppercase mb-1">Model</p>
        <CopyValue text={session.model} />
        <p className="text-[10px] text-text-muted">{duration}</p>
      </div>
      <div>
        <p className="text-[10px] text-text-muted uppercase mb-1">Usage</p>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-text-primary font-data">{formatTokens((session.tokensIn || 0) + (session.tokensOut || 0))}</p>
            <p className="text-[10px] text-text-muted">tokens</p>
          </div>
          <div>
            <p className="text-sm text-text-primary font-data">{formatDollars(session.cost)}</p>
            <p className="text-[10px] text-text-muted">cost</p>
          </div>
        </div>
      </div>
      {session.tools && session.tools.length > 0 && (
        <div className="col-span-3 pt-2 border-t border-border-default">
          <p className="text-[10px] text-text-muted uppercase mb-1.5">Tools Used</p>
          <div className="flex flex-wrap gap-1">
            {session.tools.map((tool) => (
              <span key={tool} className="text-[10px] px-2 py-0.5 rounded bg-elevated text-text-muted">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LogViewer({ sessionId }) {
  const { data: logs, isLoading } = useSessionLogs(sessionId);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (isLoading) {
    return (
      <div className="bg-[#0a0a0a] rounded-lg border border-border-default p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <SkeletonPulse className="h-3 w-16" />
            <SkeletonPulse className="h-3 w-10" />
            <SkeletonPulse className="h-3 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-lg border border-border-default p-6 text-center">
        <Terminal size={20} className="mx-auto text-text-muted mb-2" />
        <p className="text-sm text-text-muted">No logs available for this session</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] rounded-lg border border-border-default overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-default bg-elevated/30">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-text-muted" />
          <span className="text-[10px] text-text-muted font-medium uppercase">Session Logs</span>
        </div>
        <span className="text-[10px] text-text-muted">{logs.length} entries</span>
      </div>
      <div className="max-h-[360px] overflow-y-auto font-mono text-xs leading-relaxed p-3 space-y-0.5" role="log" aria-live="polite">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2 py-0.5 hover:bg-elevated/20 rounded px-1 -mx-1">
            <span className="text-text-muted shrink-0 w-20">{formatTimestamp(log.ts)}</span>
            <span className={`shrink-0 w-12 uppercase font-medium ${levelColors[log.level] || 'text-text-muted'}`}>
              {log.level}
            </span>
            <span className="text-text-secondary">{log.message}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

export default function SessionsLogs() {
  const { data: sessions = [], isLoading, error, refetch } = useSessions();
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  if (isLoading) return <SkeletonSessionsLogs />;
  if (error) return <div className="text-accent-red p-4">Error loading sessions: {error.message}</div>;

  const sessionList = Array.isArray(sessions) ? sessions : [];

  const filtered = statusFilter === 'all'
    ? sessionList
    : sessionList.filter((s) => s.status === statusFilter);

  const selected = sessionList.find((s) => s.id === selectedId);
  const statuses = ['all', 'active', 'completed', 'idle'];

  return (
    <div className="page-enter space-y-4">
      <PageHeader
        title="Sessions & Logs"
        subtitle={`${sessionList.length} sessions tracked`}
        onRefresh={refetch}
        actions={
          <div className="flex items-center gap-1 bg-surface border border-border-default rounded-md p-0.5">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '500px' }}>
        {/* Session List */}
        <div className="bg-surface border border-border-default rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-xs text-text-muted">{filtered.length} sessions</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border-default">
            {filtered.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isSelected={selectedId === session.id}
                onSelect={setSelectedId}
              />
            ))}
            {filtered.length === 0 && (
              <EmptyState
                icon={Terminal}
                title="No sessions found"
                subtitle={statusFilter !== 'all' ? `No ${statusFilter} sessions` : 'Sessions will appear here when agents run'}
              />
            )}
          </div>
        </div>

        {/* Detail + Logs Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-primary truncate">{selected.task}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-text-muted hover:text-text-secondary transition-colors"
                  aria-label="Close session details"
                >
                  <X size={16} />
                </button>
              </div>
              <SessionDetail session={selected} />
              <LogViewer sessionId={selected.id} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Terminal size={28} className="mx-auto text-text-muted mb-3" />
                <p className="text-sm text-text-muted">Select a session to view details and logs</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
