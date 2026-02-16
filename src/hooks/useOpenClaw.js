import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useSessions(options = {}) {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: api.getSessions,
    refetchInterval: 30000, // 30s
    ...options,
  });
}

export function useCronList(options = {}) {
  return useQuery({
    queryKey: ['cron-list'],
    queryFn: api.getCronList,
    refetchInterval: 60000, // 60s
    ...options,
  });
}

export function useCronStatus(options = {}) {
  return useQuery({
    queryKey: ['cron-status'],
    queryFn: api.getCronStatus,
    refetchInterval: 60000,
    ...options,
  });
}

export function useStatus(options = {}) {
  return useQuery({
    queryKey: ['status'],
    queryFn: api.getStatus,
    refetchInterval: 60000,
    ...options,
  });
}

export function useRunCron() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.runCron(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cron-list'] });
    },
  });
}

export function useToggleCron() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }) => api.toggleCron(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cron-list'] });
    },
  });
}
