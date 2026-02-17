import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const COLUMN_COLORS = {
  planning: '#3b82f6',
  'in-progress': '#eab308',
  'on-track': '#22c55e',
  complete: '#8b5cf6',
  drafted: '#3b82f6',
  'in-qa': '#eab308',
  approved: '#22c55e',
  scheduled: '#f97316',
  published: '#8b5cf6',
};

export default function KanbanColumn({ id, title, items, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id });
  const color = COLUMN_COLORS[id] || '#6b6b6b';

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] max-w-[320px] flex-1 rounded-lg border transition-colors ${
        isOver
          ? 'kanban-drop-target'
          : 'border-border-default'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-default bg-surface/50 rounded-t-lg">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-text-primary">{title}</span>
        <span className="text-xs font-data text-text-muted ml-auto bg-elevated px-1.5 py-0.5 rounded">
          {items.length}
        </span>
      </div>

      {/* Column body */}
      {!collapsed && (
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 p-2 space-y-2 min-h-[100px] bg-[#0f0f0f]/30">
            {children}
            {items.length === 0 && (
              <div className="flex items-center justify-center h-20 text-xs text-text-muted border border-dashed border-border-default rounded-md">
                Drop items here
              </div>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
