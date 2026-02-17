import { X, Target, BarChart3, Users, Calendar, FileText } from 'lucide-react';
import { AGENTS } from '../../lib/constants';

function getAgentInfo(agentId) {
  return Object.values(AGENTS).find((a) => a.id === agentId) || { name: agentId, emoji: '🤖', role: '' };
}

export default function KanbanCardDetail({ item, type = 'goal', onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-surface border-l border-border-default z-50 flex flex-col animate-slide-in-right shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <h2 className="text-sm font-semibold text-text-primary truncate">
          {type === 'goal' ? 'Goal Details' : 'Content Details'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-elevated"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {type === 'goal' ? (
          <>
            {/* Goal title */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">{item.title}</h3>
              <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue">
                Goal #{item.goalNumber}
              </span>
            </div>

            {/* Target */}
            {item.target && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Target size={12} />
                  <span>Target</span>
                </div>
                <p className="text-sm text-text-primary">{item.target}</p>
              </div>
            )}

            {/* Why */}
            {item.why && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <FileText size={12} />
                  <span>Why</span>
                </div>
                <p className="text-sm text-text-secondary">{item.why}</p>
              </div>
            )}

            {/* Metric */}
            {item.metric && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <BarChart3 size={12} />
                  <span>Key Metric</span>
                </div>
                <p className="text-sm text-text-primary">{item.metric}</p>
              </div>
            )}

            {/* Owner agents */}
            {item.agents && item.agents.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Users size={12} />
                  <span>Owner Agents</span>
                </div>
                <div className="space-y-1.5">
                  {item.agents.map((agentId) => {
                    const agent = getAgentInfo(agentId);
                    return (
                      <div
                        key={agentId}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-elevated rounded-md"
                      >
                        <span className="text-sm">{agent.emoji}</span>
                        <div className="min-w-0">
                          <span className="text-xs text-text-primary block truncate">{agent.name}</span>
                          {agent.role && (
                            <span className="text-[10px] text-text-muted block truncate">{agent.role}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Content item */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-elevated text-text-secondary">
                  {item.type}
                </span>
                <span className="text-xs text-text-muted font-data">{item.id}</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users size={14} className="text-text-muted" />
                <span className="text-text-secondary">Author:</span>
                <span className="text-text-primary">{item.authorAgent || 'Unassigned'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <BarChart3 size={14} className="text-text-muted" />
                <span className="text-text-secondary">Status:</span>
                <span className="text-text-primary capitalize">{item.status}</span>
              </div>

              {item.due && item.due !== '—' && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-text-muted" />
                  <span className="text-text-secondary">Due:</span>
                  <span className="text-text-primary">{item.due}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
