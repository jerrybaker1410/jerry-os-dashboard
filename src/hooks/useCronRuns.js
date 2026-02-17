import { useQuery } from '@tanstack/react-query';
import { fetchCronRuns } from '../lib/api';

/**
 * Fetch run history for a specific cron job.
 * Returns empty when no jobId is provided.
 */
export function useCronRuns(jobId, limit = 10) {
  return useQuery({
    queryKey: ['cron-runs', jobId, limit],
    queryFn: () => fetchCronRuns(jobId, limit),
    enabled: !!jobId,
    refetchInterval: 30000,
  });
}
