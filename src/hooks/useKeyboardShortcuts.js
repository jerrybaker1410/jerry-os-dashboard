import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Global keyboard shortcuts for the Jerry OS Dashboard.
 *
 * Shortcuts:
 *   Cmd/Ctrl+K  → open command palette
 *   g then d    → Command Center
 *   g then t    → Cron Operations
 *   g then c    → Cost Analytics
 *   g then s    → Sessions & Logs
 *   g then a    → Agent Fleet
 *   g then m    → Memory Browser
 *   g then b    → Morning Brief
 *   g then g    → Goal Tracker
 *   g then h    → System Health
 *   r           → refresh all data
 */
export default function useKeyboardShortcuts({ onTogglePalette }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pendingG = useRef(false);
  const gTimer = useRef(null);

  useEffect(() => {
    function handler(e) {
      // Ignore if typing in input/textarea/contenteditable
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        return;
      }

      // Cmd/Ctrl+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onTogglePalette?.();
        return;
      }

      // Don't handle shortcuts with modifier keys (except Cmd+K above)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // "g" prefix for navigation (vim-style)
      if (e.key === 'g' && !pendingG.current) {
        pendingG.current = true;
        clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          pendingG.current = false;
        }, 800);
        return;
      }

      if (pendingG.current) {
        pendingG.current = false;
        clearTimeout(gTimer.current);

        switch (e.key) {
          case 'd':
            navigate('/');
            return;
          case 't':
            navigate('/tasks');
            return;
          case 'c':
            navigate('/costs');
            return;
          case 's':
            navigate('/sessions');
            return;
          case 'a':
            navigate('/agents');
            return;
          case 'r':
            navigate('/tasks');
            return;
          case 'm':
            navigate('/memory');
            return;
          case 'g':
            navigate('/goals');
            return;
          case 'b':
            navigate('/brief');
            return;
          case 'h':
            navigate('/health');
            return;
        }
      }

      // "r" → refresh
      if (e.key === 'r') {
        queryClient.invalidateQueries();
        return;
      }
    }

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(gTimer.current);
    };
  }, [navigate, queryClient, onTogglePalette]);
}
