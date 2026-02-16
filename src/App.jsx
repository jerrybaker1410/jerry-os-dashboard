import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CommandCenter from './pages/CommandCenter';
import TaskQueue from './pages/TaskQueue';
import AgentProfiles from './pages/AgentProfiles';

export default function App() {
  return (
    <BrowserRouter basename="/jerry-os-dashboard">
      <div className="flex min-h-screen bg-jerry-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-screen">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/tasks" element={<TaskQueue />} />
            <Route path="/agents" element={<AgentProfiles />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
