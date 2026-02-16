import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/layout/Sidebar';
import CommandCenter from './pages/CommandCenter';
import TaskQueue from './pages/TaskQueue';
import CostAnalytics from './pages/CostAnalytics';
import SessionsLogs from './pages/SessionsLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/jerry-os-dashboard">
        <div className="flex min-h-screen bg-[#0f0f0f]">
          <Sidebar />
          <main className="flex-1 ml-56 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<CommandCenter />} />
              <Route path="/tasks" element={<TaskQueue />} />
              <Route path="/costs" element={<CostAnalytics />} />
              <Route path="/sessions" element={<SessionsLogs />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
