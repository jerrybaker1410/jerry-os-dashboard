import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/layout/Sidebar';
import CommandCenter from './pages/CommandCenter';
import CronOperations from './pages/CronOperations';
import CostAnalytics from './pages/CostAnalytics';
import SessionsLogs from './pages/SessionsLogs';
import AgentProfiles from './pages/AgentProfiles';
import MemoryBrowser from './pages/MemoryBrowser';
import MorningBrief from './pages/MorningBrief';
import GoalTracker from './pages/GoalTracker';
import SystemHealth from './pages/SystemHealth';
import { ToastProvider } from './components/shared/Toast';
import CommandPalette from './components/shared/CommandPalette';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const togglePalette = useCallback(() => setPaletteOpen((v) => !v), []);

  useKeyboardShortcuts({ onTogglePalette: togglePalette });

  return (
    <>
      <div className="flex min-h-screen bg-[#0f0f0f]">
        <Sidebar />
        <main className="flex-1 ml-56 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/tasks" element={<CronOperations />} />
            <Route path="/sessions" element={<SessionsLogs />} />
            <Route path="/agents" element={<AgentProfiles />} />
            <Route path="/memory" element={<MemoryBrowser />} />
            <Route path="/costs" element={<CostAnalytics />} />
            <Route path="/brief" element={<MorningBrief />} />
            <Route path="/goals" element={<GoalTracker />} />
            <Route path="/health" element={<SystemHealth />} />
          </Routes>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter basename="/jerry-os-dashboard/overview">
          <AppShell />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
