import { useQuery } from '@tanstack/react-query';
import { fetchCostData } from '../lib/api';
import { REFRESH_INTERVALS } from '../lib/constants';

export function useCostData() {
  return useQuery({
    queryKey: ['costs'],
    queryFn: fetchCostData,
    refetchInterval: REFRESH_INTERVALS.COSTS,
    staleTime: 30000,
  });
}
