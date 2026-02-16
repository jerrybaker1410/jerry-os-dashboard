import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, DollarSign, Terminal, Brain, ChevronRight } from 'lucide-react';
import { AGENTS, NAV_ITEMS } from '../../lib/constants';

const iconMap = {
  LayoutDashboard,
  ListTodo,
  DollarSign,
  Terminal,
};

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-surface border-r border-border-default flex flex-col fixed left-0 top-0 z-10">
      {/* Branding */}
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-accent-blue" />
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-tight">Jerry OS</h1>
            <p className="text-[10px] text-text-muted">Multi-Agent Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider text-text-muted px-2 mb-2">Navigation</p>
        {NAV_ITEMS.map(item => {
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
              {Icon && <Icon size={16} />}
              <span>{item.label}</span>
              <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          );
        })}
      </nav>

      {/* Agent Status */}
      <div className="border-t border-border-default p-3">
        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Agents</p>
        <div className="space-y-1.5">
          {Object.values(AGENTS).map(agent => (
            <div key={agent.id} className="flex items-center gap-2 px-1">
              <span className="text-xs">{agent.emoji}</span>
              <span className="text-xs text-text-secondary truncate flex-1">{agent.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-green" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border-default px-4 py-2">
        <p className="text-[10px] text-text-muted">OpenClaw v0.1 · Mock Mode</p>
      </div>
    </aside>
  );
}
