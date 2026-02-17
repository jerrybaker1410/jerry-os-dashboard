import { useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/layout/Sidebar';
import { ToastProvider } from './components/shared/Toast';
import CommandPalette from './components/shared/CommandPalette';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { SkeletonDashboard } from './components/shared/Skeleton';

// ─── Lazy-loaded pages (code-split per route) ───────────────
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const CronOperations = lazy(() => import('./pages/CronOperations'));
const CostAnalytics = lazy(() => import('./pages/CostAnalytics'));
const SessionsLogs = lazy(() => import('./pages/SessionsLogs'));
const AgentProfiles = lazy(() => import('./pages/AgentProfiles'));
const MemoryBrowser = lazy(() => import('./pages/MemoryBrowser'));
const MorningBrief = lazy(() => import('./pages/MorningBrief'));
const GoalTracker = lazy(() => import('./pages/GoalTracker'));
const SystemHealth = lazy(() => import('./pages/SystemHealth'));
const KanbanBoard = lazy(() => import('./pages/KanbanBoard'));

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
          <Suspense fallback={<SkeletonDashboard />}>
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
              <Route path="/kanban" element={<KanbanBoard />} />
            </Routes>
          </Suspense>
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
