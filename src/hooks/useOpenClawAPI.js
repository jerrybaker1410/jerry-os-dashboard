import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardData,
  fetchSessions,
  fetchTaskQueue,
  fetchSessionLogs,
} from '../lib/api';
import { REFRESH_INTERVALS } from '../lib/constants';

/**
 * Main dashboard hook — returns all data needed for CommandCenter.
 * Shape: standard react-query { data, isLoading, error, refetch }
 * data = { sessions, tasks, costs, agentStats, recentActivity }
 */
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
  });
}

/**
 * Sessions list — returns array of session objects.
 * data = Session[]
 */
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
  });
}

/**
 * Task queue — returns array of task objects.
 * data = Task[]
 */
export function useTaskQueue() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTaskQueue,
    refetchInterval: REFRESH_INTERVALS.TASKS,
  });
}

/**
 * Session logs for a specific session.
 * data = LogEntry[]
 */
export function useSessionLogs(sessionId) {
  return useQuery({
    queryKey: ['logs', sessionId],
    queryFn: () => fetchSessionLogs(sessionId),
    enabled: !!sessionId,
  });
}
