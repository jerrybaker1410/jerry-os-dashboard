import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, Target, Users } from 'lucide-react';
import { AGENTS } from '../../lib/constants';

// Look up agent by id to get emoji
function getAgentEmoji(agentId) {
  const agent = Object.values(AGENTS).find((a) => a.id === agentId);
  return agent?.emoji || '🤖';
}

function getAgentName(agentId) {
  const agent = Object.values(AGENTS).find((a) => a.id === agentId);
  return agent?.name || agentId;
}

export default function KanbanCard({ item, type = 'goal', onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (type === 'goal') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group bg-surface border border-border-default rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-border-hover transition-all ${
          isDragging ? 'kanban-card-dragging' : ''
        }`}
        onClick={onClick}
      >
        {/* Drag handle + goal number */}
        <div className="flex items-start gap-2 mb-2">
          <button
            type="button"
            className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-text-primary leading-snug truncate">
              {item.title}
            </h4>
          </div>
        </div>

        {/* Target metric */}
        {item.target && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-text-secondary">
            <Target size={11} className="text-accent-blue shrink-0" />
            <span className="truncate">{item.target}</span>
          </div>
        )}

        {/* Metric */}
        {item.metric && (
          <p className="text-[11px] text-text-muted mb-2 line-clamp-2">{item.metric}</p>
        )}

        {/* Agent avatars */}
        {item.agents && item.agents.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {item.agents.slice(0, 4).map((agentId) => (
              <span
                key={agentId}
                className="inline-flex items-center gap-1 text-[10px] bg-elevated px-1.5 py-0.5 rounded-full text-text-secondary"
                title={getAgentName(agentId)}
              >
                {getAgentEmoji(agentId)}
                <span className="truncate max-w-[60px]">{getAgentName(agentId).split(' ')[0]}</span>
              </span>
            ))}
            {item.agents.length > 4 && (
              <span className="text-[10px] text-text-muted">+{item.agents.length - 4}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Content pipeline card
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-surface border border-border-default rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-border-hover transition-all ${
        isDragging ? 'kanban-card-dragging' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 mb-2">
        <button
          type="button"
          className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-elevated text-text-secondary">
              {item.type || 'content'}
            </span>
            <span className="text-[10px] text-text-muted font-data">{item.id}</span>
          </div>
          <h4 className="text-sm font-medium text-text-primary leading-snug truncate">
            {item.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center gap-1">
          <Users size={11} />
          <span>{item.authorAgent || 'unassigned'}</span>
        </div>
        {item.due && item.due !== '—' && (
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>{item.due}</span>
          </div>
        )}
      </div>
    </div>
  );
}
