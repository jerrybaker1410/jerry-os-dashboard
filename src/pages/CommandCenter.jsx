import { Activity, Bot, Clock, Cpu, Zap, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { useSessions, useCronList, useCronStatus } from '../hooks/useOpenClaw';
import MetricCard from '../components/MetricCard';
import SessionCard from '../components/SessionCard';
import TaskFeed from '../components/TaskFeed';
import CostChart from '../components/CostChart';
import { formatTokens, timeAgo, cn } from '../lib/utils';

export default function CommandCenter() {
  const { data: sessionsData, isLoading: sessionsLoading, refetch: refetchSessions } = useSessions();
  const { data: cronData, isLoading: cronLoading, refetch: refetchCron } = useCronList();
  const { data: cronStatus, isLoading: statusLoading } = useCronStatus();

  const sessions = sessionsData?.sessions || [];
  const cronJobs = cronData?.jobs || [];

  // Metrics
  const activeSessions = sessions.filter(s => s.ageMs < 300000).length;
  const totalTokens = sessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);
  const enabledCrons = cronJobs.filter(j => j.enabled).length;
  const totalCrons = cronJobs.length;
  const uniqueModels = [...new Set(sessions.map(s => s.model).filter(Boolean))].length;

  const handleRefresh = () => {
    refetchSessions();
    refetchCron();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-neon-green" size={24} />
            Command Center
          </h2>
          <p className="text-sm text-jerry-400 mt-1">Real-time overview of your agent infrastructure</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jerry-700/50 text-jerry-300 hover:text-white hover:bg-jerry-600/50 transition-all text-sm"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Sessions"
          value={sessionsLoading ? '...' : activeSessions}
          subtitle={`${sessions.length} total`}
          icon={Bot}
          color="green"
        />
        <MetricCard
          title="Total Tokens"
          value={sessionsLoading ? '...' : formatTokens(totalTokens)}
          subtitle="across all sessions"
          icon={Zap}
          color="blue"
        />
        <MetricCard
          title="Cron Jobs"
          value={cronLoading ? '...' : `${enabledCrons}/${totalCrons}`}
          subtitle={cronStatus ? `Next: ${timeAgo(cronStatus.nextWakeAtMs)}` : ''}
          icon={Calendar}
          color="purple"
        />
        <MetricCard
          title="Models"
          value={sessionsLoading ? '...' : uniqueModels}
          subtitle="unique models in use"
          icon={Cpu}
          color="orange"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Session Cards - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-jerry-300 uppercase tracking-wider flex items-center gap-2">
            <Bot size={14} />
            Agent Sessions
            {sessionsLoading && <span className="text-jerry-500 font-normal">(loading...)</span>}
          </h3>
          {sessions.length === 0 && !sessionsLoading ? (
            <div className="card p-8 text-center text-jerry-500">No sessions found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions
                .sort((a, b) => a.ageMs - b.ageMs)
                .slice(0, 8)
                .map(session => (
                  <SessionCard key={session.key} session={session} />
                ))}
            </div>
          )}
          {sessions.length > 8 && (
            <p className="text-xs text-jerry-500 text-center">+{sessions.length - 8} more sessions</p>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Cost / Token Chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-jerry-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <BarChart3 size={14} />
              Token Distribution
            </h3>
            <CostChart sessions={sessions} />
          </div>

          {/* Task Feed */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-jerry-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Clock size={14} />
              Upcoming Tasks
            </h3>
            <TaskFeed jobs={cronJobs} />
          </div>
        </div>
      </div>
    </div>
  );
}
