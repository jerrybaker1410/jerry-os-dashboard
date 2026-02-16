import { useQuery } from '@tanstack/react-query';
import { fetchStatus, fetchSessions } from '../lib/api';

export function useStatus(options = {}) {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 60000,
    ...options,
  });
}

export function useSessions(options = {}) {
  return useQuery({
    queryKey: ['sessions-raw'],
    queryFn: async () => {
      const sessions = await fetchSessions();
      // AgentProfiles expects { sessions: [...] } with key-based shape
      // Transform mock data to match
      return {
        sessions: sessions.map((s) => ({
          ...s,
          key: `agent:${s.agent}:${s.status === 'active' ? 'main' : 'subagent:' + s.id}`,
          ageMs: s.startedAt ? Date.now() - new Date(s.startedAt).getTime() : null,
          totalTokens: (s.tokensIn || 0) + (s.tokensOut || 0),
        })),
      };
    },
    refetchInterval: 30000,
    ...options,
  });
}
