import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanSquare, Target, FileText } from 'lucide-react';
import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';
import KanbanCardDetail from '../components/kanban/KanbanCardDetail';
import { SkeletonDashboard } from '../components/shared/Skeleton';
import {
  useGoals,
  useGoalsStatus,
  useUpdateGoalsStatus,
  useContentQueue,
  useUpdateContentQueue,
} from '../hooks/useOpenClawAPI';

// ─── Goal columns ──────────────────────────────────────────
const GOAL_COLUMNS = [
  { id: 'planning', title: 'Planning' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'on-track', title: 'On Track' },
  { id: 'complete', title: 'Complete' },
];

// ─── Content pipeline columns ──────────────────────────────
const CONTENT_COLUMNS = [
  { id: 'drafted', title: 'Drafted' },
  { id: 'in-qa', title: 'In QA' },
  { id: 'approved', title: 'Approved' },
  { id: 'scheduled', title: 'Scheduled' },
  { id: 'published', title: 'Published' },
];

// ─── Parse goals.md into card objects ──────────────────────
function parseGoals(content) {
  if (!content) return [];
  const goals = [];
  const goalRegex = /### (\d+)\.\s+(.+)\n\*\*Target:\*\*\s*(.+)\n\*\*Why:\*\*\s*(.+)\n\*\*Metric:\*\*\s*(.+)\n\*\*Owner agents:\*\*\s*(.+)/g;
  let match;
  while ((match = goalRegex.exec(content)) !== null) {
    const agents = match[6].split(',').map((a) => a.trim()).filter(Boolean);
    // Normalize "Jerry Baker (main)" to "main"
    const normalizedAgents = agents.map((a) => {
      const parenMatch = a.match(/\(([^)]+)\)/);
      return parenMatch ? parenMatch[1] : a;
    });
    goals.push({
      id: `goal-${match[1]}`,
      goalNumber: parseInt(match[1], 10),
      title: match[2].trim(),
      target: match[3].trim(),
      why: match[4].trim(),
      metric: match[5].trim(),
      agents: normalizedAgents,
    });
  }
  return goals;
}

// ─── Main Component ────────────────────────────────────────
export default function KanbanBoard() {
  const [activeTab, setActiveTab] = useState('goals');
  const [activeId, setActiveId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  // Data hooks
  const { data: goalsData, isLoading: goalsLoading } = useGoals();
  const { data: statusData, isLoading: statusLoading } = useGoalsStatus();
  const updateGoalsStatusMutation = useUpdateGoalsStatus();

  const { data: contentItems = [], isLoading: contentLoading } = useContentQueue();
  const updateContentMutation = useUpdateContentQueue();

  // Parse goals
  const goals = useMemo(() => parseGoals(goalsData?.content), [goalsData]);

  // Build column → goals mapping
  const goalsByColumn = useMemo(() => {
    const columns = {};
    GOAL_COLUMNS.forEach((col) => {
      columns[col.id] = [];
    });

    if (goals.length > 0) {
      const colMap = statusData?.columns || {};
      goals.forEach((goal) => {
        const colId = colMap[goal.id] || 'planning';
        if (columns[colId]) {
          columns[colId].push(goal);
        } else {
          columns.planning.push(goal);
        }
      });

      // Apply ordering within columns
      const orderMap = statusData?.order || {};
      Object.keys(columns).forEach((colId) => {
        const order = orderMap[colId];
        if (order) {
          columns[colId].sort((a, b) => {
            const ai = order.indexOf(a.id);
            const bi = order.indexOf(b.id);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          });
        }
      });
    }

    return columns;
  }, [goals, statusData]);

  // Build column → content items mapping
  const contentByColumn = useMemo(() => {
    const columns = {};
    CONTENT_COLUMNS.forEach((col) => {
      columns[col.id] = [];
    });
    contentItems.forEach((item) => {
      const status = (item.status || 'drafted').toLowerCase();
      if (columns[status]) {
        columns[status].push(item);
      } else {
        columns.drafted.push(item);
      }
    });
    return columns;
  }, [contentItems]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Find which column an item is in
  const findGoalColumn = useCallback(
    (itemId) => {
      for (const [colId, items] of Object.entries(goalsByColumn)) {
        if (items.some((i) => i.id === itemId)) return colId;
      }
      return null;
    },
    [goalsByColumn]
  );

  const findContentColumn = useCallback(
    (itemId) => {
      for (const [colId, items] of Object.entries(contentByColumn)) {
        if (items.some((i) => i.id === itemId)) return colId;
      }
      return null;
    },
    [contentByColumn]
  );

  // Active dragged item
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    if (activeTab === 'goals') {
      return goals.find((g) => g.id === activeId);
    }
    return contentItems.find((i) => i.id === activeId);
  }, [activeId, activeTab, goals, contentItems]);

  // ─── Goals Drag Handlers ─────────────────────────────────
  function handleGoalDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleGoalDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeColId = findGoalColumn(active.id);

    // Determine target column — could be dropping over a column or over another card
    let overColId = null;
    // Check if over.id is a column ID
    if (GOAL_COLUMNS.some((c) => c.id === over.id)) {
      overColId = over.id;
    } else {
      // It's a card — find its column
      overColId = findGoalColumn(over.id);
    }

    if (!activeColId || !overColId) return;

    // Build new column state
    const newColumns = { ...statusData?.columns || {} };
    const newOrder = { ...statusData?.order || {} };

    newColumns[active.id] = overColId;

    // Update ordering within the target column
    const targetItems = [...(goalsByColumn[overColId] || [])];
    if (activeColId === overColId) {
      // Same column reorder
      const oldIndex = targetItems.findIndex((i) => i.id === active.id);
      const newIndex = targetItems.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(targetItems, oldIndex, newIndex);
        newOrder[overColId] = reordered.map((i) => i.id);
      }
    } else {
      // Cross-column move — add to end of target
      const movedItem = goals.find((g) => g.id === active.id);
      if (movedItem) {
        const existing = targetItems.filter((i) => i.id !== active.id);
        const overIndex = existing.findIndex((i) => i.id === over.id);
        if (overIndex !== -1) {
          existing.splice(overIndex + 1, 0, movedItem);
        } else {
          existing.push(movedItem);
        }
        newOrder[overColId] = existing.map((i) => i.id);
      }

      // Remove from old column order
      const oldItems = (goalsByColumn[activeColId] || []).filter((i) => i.id !== active.id);
      newOrder[activeColId] = oldItems.map((i) => i.id);
    }

    updateGoalsStatusMutation.mutate({ columns: newColumns, order: newOrder });
  }

  // ─── Content Drag Handlers ───────────────────────────────
  function handleContentDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleContentDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Find target column
    let overColId = null;
    if (CONTENT_COLUMNS.some((c) => c.id === over.id)) {
      overColId = over.id;
    } else {
      overColId = findContentColumn(over.id);
    }

    if (!overColId) return;

    // Update the item's status
    const updated = contentItems.map((item) =>
      item.id === active.id ? { ...item, status: overColId } : item
    );

    updateContentMutation.mutate(updated);
  }

  // Loading state
  const isLoading = activeTab === 'goals' ? (goalsLoading || statusLoading) : contentLoading;

  if (isLoading) {
    return (
      <div className="page-enter">
        <SkeletonDashboard />
      </div>
    );
  }

  const currentColumns = activeTab === 'goals' ? GOAL_COLUMNS : CONTENT_COLUMNS;
  const currentData = activeTab === 'goals' ? goalsByColumn : contentByColumn;

  return (
    <div className="page-enter space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KanbanSquare size={20} className="text-accent-blue" />
          <h1 className="text-lg font-semibold text-text-primary">Kanban Board</h1>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center bg-surface border border-border-default rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-accent-blue/10 text-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Target size={13} />
            Goals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'content'
                ? 'bg-accent-blue/10 text-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText size={13} />
            Content Pipeline
          </button>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={activeTab === 'goals' ? handleGoalDragStart : handleContentDragStart}
        onDragEnd={activeTab === 'goals' ? handleGoalDragEnd : handleContentDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {currentColumns.map((col) => {
            const items = currentData[col.id] || [];
            return (
              <KanbanColumn key={col.id} id={col.id} title={col.title} items={items}>
                {items.map((item) => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    type={activeTab === 'goals' ? 'goal' : 'content'}
                    onClick={() => setDetailItem(item)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>

        {/* Drag overlay for smooth animation */}
        <DragOverlay>
          {activeItem ? (
            <div className="kanban-card-dragging">
              <KanbanCard
                item={activeItem}
                type={activeTab === 'goals' ? 'goal' : 'content'}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state for content pipeline */}
      {activeTab === 'content' && contentItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={40} className="text-text-muted mb-3" />
          <h3 className="text-sm font-medium text-text-primary mb-1">Content Pipeline Empty</h3>
          <p className="text-xs text-text-muted max-w-sm">
            No content items in the queue yet. Content is added by Jerry Baker and the content-orchestrator agent as the pipeline runs.
          </p>
        </div>
      )}

      {/* Detail drawer */}
      {detailItem && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setDetailItem(null)}
          />
          <KanbanCardDetail
            item={detailItem}
            type={activeTab === 'goals' ? 'goal' : 'content'}
            onClose={() => setDetailItem(null)}
          />
        </>
      )}
    </div>
  );
}
