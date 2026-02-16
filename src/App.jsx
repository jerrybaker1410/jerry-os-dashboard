import { useState, useEffect } from 'react';

function App() {
  const [sessions, setSessions] = useState([]);
  const [crons, setCrons] = useState([]);

  useEffect(() => {
    // Placeholder data - real OpenClaw API proxy next
    setSessions([
      { sessionKey: 'main:main', status: 'active', lastActive: '11:17 AM' },
      { sessionKey: 'sub-agent-1', status: 'idle', lastActive: '10:45 AM' }
    ]);
    setCrons([
      { name: 'Daily Trend Scout', schedule: '7:00 AM M-F' },
      { name: 'Morning Briefing', schedule: '8:00 AM M-F' }
    ]);

    // TODO: Poll gateway APIs via proxy endpoint
    const interval = setInterval(() => {
      // fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-8 font-sans">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
          Jerry OS Dashboard
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
          Live view: agents, costs, crons, tasks. MVP v0.1 – Tailwind only.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        {/* Sessions */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group">
          <div className="flex items-center mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <h3 className="text-2xl font-bold text-slate-100">Active Sessions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 font-semibold text-slate-300">Session Key</th>
                  <th className="text-left py-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-4 font-semibold text-slate-300">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 font-mono text-slate-200 truncate max-w-[200px]">{s.sessionKey}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        s.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{s.lastActive}</td>
                  </tr>
                ))}
                {!sessions.length && (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-500 text-lg">Loading sessions...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crons */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 lg:col-span-1 xl:col-span-1">
          <div className="flex items-center mb-6">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
            <h3 className="text-2xl font-bold text-slate-100">Cron Jobs</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-auto">
            {crons.map((c, i) => (
              <div key={i} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:bg-slate-700/50 transition-all">
                <div className="font-semibold text-slate-200">{c.name}</div>
                <div className="text-sm text-slate-400">{c.schedule}</div>
              </div>
            ))}
            {!crons.length && <div className="text-center py-12 text-slate-500">Loading crons...</div>}
          </div>
        </div>

        {/* Costs Placeholder */}
        <div className="lg:col-span-2 xl:col-span-1 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3"></div>
            <h3 className="text-2xl font-bold text-slate-100">Token Costs (24h)</h3>
          </div>
          <div className="text-4xl font-black text-green-400 mb-2">$12.47</div>
          <div className="text-sm text-slate-400 mb-6">↓ 8% from yesterday</div>
          <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700/50">
            <span className="text-slate-500 text-sm">Recharts chart → npm i recharts</span>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-sm text-slate-500 pt-12 border-t border-slate-800">
        Powered by OpenClaw + Vite + Tailwind | v0.1 MVP | Next: Real API proxy & charts
      </footer>
    </div>
  );
}

export default App;
