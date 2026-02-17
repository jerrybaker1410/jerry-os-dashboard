import { useQuery } from '@tanstack/react-query';
import { fetchMemorySearch, fetchMemoryContent } from '../lib/api';

/**
 * Search memory with debounced query.
 * Only fires when query has 2+ characters.
 */
export function useMemorySearch(query, limit = 20) {
  return useQuery({
    queryKey: ['memory-search', query, limit],
    queryFn: () => fetchMemorySearch(query, limit),
    enabled: query.length >= 2,
    staleTime: 60000,
  });
}

/**
 * Fetch content of a specific memory file.
 */
export function useMemoryContent(filePath) {
  return useQuery({
    queryKey: ['memory-content', filePath],
    queryFn: () => fetchMemoryContent(filePath),
    enabled: !!filePath,
    staleTime: 60000,
  });
}
