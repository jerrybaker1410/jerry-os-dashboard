import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDashboardData,
  fetchSessions,
  fetchCronJobs,
  fetchSessionLogs,
  fetchActivity,
  fetchCronRuns,
  fetchGatewayHealth,
  fetchChannels,
  fetchBrief,
  fetchMemorySearch,
  fetchMemoryStatus,
  fetchGoalsStatus,
  updateGoalsStatus,
  fetchGoals,
  fetchContentQueue,
  updateContentQueue,
} from '../lib/api';
import { REFRESH_INTERVALS } from '../lib/constants';

/**
 * Main dashboard hook — returns all data from the real API.
 * No mock fallback. Errors propagate to the UI.
 */
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
  });
}

/**
 * Sessions list — returns real OpenClaw sessions.
 */
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
  });
}

/**
 * Task queue — returns real cron jobs.
 */
export function useTaskQueue() {
  return useQuery({
    queryKey: ['cron-jobs'],
    queryFn: fetchCronJobs,
    refetchInterval: REFRESH_INTERVALS.TASKS,
  });
}

/**
 * Session logs for a specific session.
 * Currently returns empty — OpenClaw doesn't expose this yet.
 */
export function useSessionLogs(sessionId) {
  return useQuery({
    queryKey: ['logs', sessionId],
    queryFn: () => fetchSessionLogs(sessionId),
    enabled: !!sessionId,
  });
}

/**
 * Activity feed — derived from real sessions + cron runs.
 */
export function useActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
  });
}

/**
 * Cron run history for a specific job.
 */
export function useCronRuns(jobId, limit = 10) {
  return useQuery({
    queryKey: ['cron-runs', jobId, limit],
    queryFn: () => fetchCronRuns(jobId, limit),
    enabled: !!jobId,
    refetchInterval: 30000,
  });
}

/**
 * Gateway health data.
 */
export function useGatewayHealth() {
  return useQuery({
    queryKey: ['gateway-health'],
    queryFn: fetchGatewayHealth,
    refetchInterval: 60000,
  });
}

/**
 * Channel connectivity status.
 */
export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
    refetchInterval: 60000,
  });
}

/**
 * Morning brief aggregate.
 */
export function useBrief() {
  return useQuery({
    queryKey: ['brief'],
    queryFn: fetchBrief,
    refetchInterval: 120000,
  });
}

/**
 * Memory search with debounced query.
 */
export function useMemorySearch(query, limit = 20) {
  return useQuery({
    queryKey: ['memory-search', query, limit],
    queryFn: () => fetchMemorySearch(query, limit),
    enabled: !!query && query.length >= 2,
  });
}

/**
 * Memory index status.
 */
export function useMemoryStatus() {
  return useQuery({
    queryKey: ['memory-status'],
    queryFn: fetchMemoryStatus,
  });
}

// ─── Kanban: Goals Board ─────────────────────────────────────

/**
 * Goals data from goals.md.
 */
export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });
}

/**
 * Goals board column/order state from goals-status.json.
 */
export function useGoalsStatus() {
  return useQuery({
    queryKey: ['goals-status'],
    queryFn: fetchGoalsStatus,
  });
}

/**
 * Optimistic mutation for moving goals between columns.
 */
export function useUpdateGoalsStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGoalsStatus,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['goals-status'] });
      const prev = queryClient.getQueryData(['goals-status']);
      queryClient.setQueryData(['goals-status'], newData);
      return { prev };
    },
    onError: (_err, _newData, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['goals-status'], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals-status'] });
    },
  });
}

// ─── Kanban: Content Pipeline ─────────────────────────────────

/**
 * Content queue items from content-queue.md.
 */
export function useContentQueue() {
  return useQuery({
    queryKey: ['content-queue'],
    queryFn: fetchContentQueue,
  });
}

/**
 * Optimistic mutation for moving content items between statuses.
 */
export function useUpdateContentQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContentQueue,
    onMutate: async (newItems) => {
      await queryClient.cancelQueries({ queryKey: ['content-queue'] });
      const prev = queryClient.getQueryData(['content-queue']);
      queryClient.setQueryData(['content-queue'], newItems);
      return { prev };
    },
    onError: (_err, _newItems, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['content-queue'], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['content-queue'] });
    },
  });
}
