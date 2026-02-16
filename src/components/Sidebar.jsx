import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Users, Activity, Cog } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Command Center' },
  { to: '/tasks', icon: ListTodo, label: 'Task Queue' },
  { to: '/agents', icon: Users, label: 'Agent Profiles' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-jerry-600/30 bg-jerry-900/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-jerry-600/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🦞</span>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Jerry OS</h1>
            <p className="text-xs text-jerry-400 font-mono">v1.0 • Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/20'
                  : 'text-jerry-300 hover:text-white hover:bg-jerry-700/50'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-jerry-600/30">
        <div className="flex items-center gap-2 text-xs text-jerry-400">
          <Activity size={12} className="text-neon-green pulse-dot" />
          <span>Gateway Online</span>
        </div>
        <div className="text-xs text-jerry-500 mt-1 font-mono">
          Port 18789 • OpenClaw 2026.2.15
        </div>
      </div>
    </aside>
  );
}
