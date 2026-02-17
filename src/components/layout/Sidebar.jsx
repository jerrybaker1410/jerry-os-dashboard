import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ListTodo, DollarSign, Terminal, Users,
  Brain, Clock, Target, Sun, Activity, ChevronRight,
} from 'lucide-react';
import { AGENTS, AGENT_TEAMS, NAV_ITEMS } from '../../lib/constants';

const iconMap = {
  LayoutDashboard,
  ListTodo,
  DollarSign,
  Terminal,
  Users,
  Brain,
  Clock,
  Target,
  Sun,
  Activity,
};

// Group nav items by section
function groupBySection(items) {
  const groups = [];
  let currentSection = null;
  for (const item of items) {
    if (item.section !== currentSection) {
      currentSection = item.section;
      groups.push({ section: currentSection, items: [] });
    }
    groups[groups.length - 1].items.push(item);
  }
  return groups;
}

export default function Sidebar() {
  const sections = groupBySection(NAV_ITEMS);

  return (
    <aside className="w-56 h-screen bg-surface border-r border-border-default flex flex-col fixed left-0 top-0 z-10">
      {/* Branding */}
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-accent-blue" />
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-tight">Jerry OS</h1>
            <p className="text-[10px] text-text-muted">AI Mission Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {sections.map((group) => (
          <div key={group.section} className="mb-2">
            <p className="text-[9px] uppercase tracking-wider text-text-muted px-2.5 py-1.5">{group.section}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors group ${
                        isActive
                          ? 'bg-accent-blue/10 text-accent-blue'
                          : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                      }`
                    }
                  >
                    {Icon && <Icon size={15} />}
                    <span>{item.label}</span>
                    <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Fleet Summary */}
      <div className="border-t border-border-default p-3">
        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Fleet · {Object.keys(AGENTS).length} agents</p>
        <div className="space-y-1.5">
          {Object.values(AGENT_TEAMS).map((team) => {
            const count = Object.values(AGENTS).filter((a) => a.team === team.id).length;
            return (
              <div key={team.id} className="flex items-center gap-2 px-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="text-[10px] text-text-secondary truncate flex-1">{team.label}</span>
                <span className="text-[10px] text-text-muted font-data">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border-default px-4 py-2 flex items-center justify-between">
        <p className="text-[10px] text-text-muted">OpenClaw · Live</p>
        <kbd className="text-[9px] text-text-muted bg-elevated px-1 py-0.5 rounded border border-border-default">⌘K</kbd>
      </div>
    </aside>
  );
}
