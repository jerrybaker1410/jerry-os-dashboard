import { useQuery } from '@tanstack/react-query';
import { fetchCostData } from '../lib/api';
import { REFRESH_INTERVALS } from '../lib/constants';

/**
 * OpenRouter cost data — real API.
 * Returns { connected, usage, usageDaily, usageWeekly, usageMonthly, limit, limitRemaining }
 * If no API key configured, returns { connected: false, error: '...' }
 */
export function useCostData() {
  return useQuery({
    queryKey: ['costs'],
    queryFn: fetchCostData,
    refetchInterval: REFRESH_INTERVALS.COSTS,
    staleTime: 30000,
  });
}
