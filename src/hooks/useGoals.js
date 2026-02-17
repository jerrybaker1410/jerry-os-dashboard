import { useQuery } from '@tanstack/react-query';
import { fetchGoals } from '../lib/api';

/**
 * Fetch business goals from the brain directory.
 */
export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
    staleTime: 300000, // 5 min — goals don't change often
  });
}
