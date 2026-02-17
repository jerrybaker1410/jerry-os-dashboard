import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, LayoutDashboard, ListTodo, DollarSign, Terminal,
  Users, Clock, Brain, Target, RefreshCw, Command, AlertOctagon,
  Sun, Activity, KanbanSquare,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const ICONS = {
  LayoutDashboard,
  ListTodo,
  DollarSign,
  Terminal,
  Users,
  Clock,
  Brain,
  Target,
  RefreshCw,
  AlertOctagon,
  Sun,
  Activity,
  KanbanSquare,
};

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const commands = useMemo(() => [
    { id: 'nav-dashboard', label: 'Go to Command Center', icon: 'LayoutDashboard', group: 'Navigate', shortcut: 'g d', action: () => navigate('/') },
    { id: 'nav-crons', label: 'Go to Cron Operations', icon: 'Clock', group: 'Navigate', shortcut: 'g t', action: () => navigate('/tasks') },
    { id: 'nav-sessions', label: 'Go to Sessions & Logs', icon: 'Terminal', group: 'Navigate', shortcut: 'g s', action: () => navigate('/sessions') },
    { id: 'nav-agents', label: 'Go to Agent Fleet', icon: 'Users', group: 'Navigate', shortcut: 'g a', action: () => navigate('/agents') },
    { id: 'nav-memory', label: 'Go to Memory Browser', icon: 'Brain', group: 'Navigate', shortcut: 'g m', action: () => navigate('/memory') },
    { id: 'nav-costs', label: 'Go to Cost Analytics', icon: 'DollarSign', group: 'Navigate', shortcut: 'g c', action: () => navigate('/costs') },
    { id: 'nav-goals', label: 'Go to Goal Tracker', icon: 'Target', group: 'Navigate', shortcut: 'g g', action: () => navigate('/goals') },
    { id: 'nav-brief', label: 'Go to Morning Brief', icon: 'Sun', group: 'Navigate', shortcut: 'g b', action: () => navigate('/brief') },
    { id: 'nav-health', label: 'Go to System Health', icon: 'Activity', group: 'Navigate', shortcut: 'g h', action: () => navigate('/health') },
    { id: 'nav-kanban', label: 'Go to Kanban Board', icon: 'KanbanSquare', group: 'Navigate', shortcut: 'g k', action: () => navigate('/kanban') },
    { id: 'search-memory', label: 'Search memories...', icon: 'Brain', group: 'Search', action: () => navigate('/memory') },
    { id: 'search-agents', label: 'Find agent...', icon: 'Users', group: 'Search', action: () => navigate('/agents') },
    { id: 'refresh', label: 'Refresh all data', icon: 'RefreshCw', group: 'Actions', action: () => queryClient.invalidateQueries() },
    {
      id: 'emergency-stop',
      label: 'Emergency Stop — kill all sessions',
      icon: 'AlertOctagon',
      group: 'Actions',
      danger: true,
      action: async () => {
        try {
          await fetch(`${import.meta.env.BASE_URL}api/emergency/stop`, { method: 'POST' });
          queryClient.invalidateQueries();
        } catch { /* ignore */ }
      },
    },
  ], [navigate, queryClient]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [query, commands]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      }
    },
    [filtered, selectedIndex, onClose]
  );

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  // Group commands
  const groups = {};
  filtered.forEach((cmd) => {
    if (!groups[cmd.group]) groups[cmd.group] = [];
    groups[cmd.group].push(cmd);
  });

  let flatIndex = -1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 animate-palette-in" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="bg-surface border border-border-hover rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default">
            <Search size={16} className="text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              aria-label="Command search"
            />
            <kbd className="text-[10px] text-text-muted bg-elevated px-1.5 py-0.5 rounded border border-border-default">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
            {filtered.length === 0 && (
              <p className="text-sm text-text-muted text-center py-6">No commands found</p>
            )}
            {Object.entries(groups).map(([group, cmds]) => (
              <div key={group}>
                <p className="text-[10px] uppercase tracking-wider text-text-muted px-4 py-1.5">
                  {group}
                </p>
                {cmds.map((cmd) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const Icon = ICONS[cmd.icon] || Command;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      data-index={idx}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        isSelected ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-secondary hover:bg-elevated'
                      } ${cmd.danger ? 'text-accent-red' : ''}`}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <Icon size={16} className={cmd.danger ? 'text-accent-red' : ''} />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] text-text-muted bg-elevated px-1.5 py-0.5 rounded border border-border-default">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border-default px-4 py-2 flex items-center gap-4 text-[10px] text-text-muted">
            <span><kbd className="bg-elevated px-1 rounded border border-border-default">↑↓</kbd> navigate</span>
            <span><kbd className="bg-elevated px-1 rounded border border-border-default">↵</kbd> select</span>
            <span><kbd className="bg-elevated px-1 rounded border border-border-default">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}
