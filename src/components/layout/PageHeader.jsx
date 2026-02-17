import { useRef, useState } from 'react';
import { RefreshCw, AlertOctagon } from 'lucide-react';
import { useToast } from '../shared/Toast';
import { useQueryClient } from '@tanstack/react-query';

export default function PageHeader({ title, subtitle, actions, onRefresh }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [primed, setPrimed] = useState(false);
  const timerRef = useRef(null);

  const handleEmergencyStop = async () => {
    if (!primed) {
      setPrimed(true);
      toast.warning('Click again within 3s to confirm EMERGENCY STOP');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPrimed(false), 3000);
      return;
    }

    // Second click — execute
    setPrimed(false);
    clearTimeout(timerRef.current);
    try {
      await fetch(`${import.meta.env.BASE_URL}api/emergency/stop`, { method: 'POST' });
      toast.warning('Kill signal sent — checking status…');
      queryClient.invalidateQueries();
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to send kill signal (is proxy running?)');
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}

        <button
          type="button"
          onClick={handleEmergencyStop}
          className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-colors text-sm font-medium ${
            primed
              ? 'bg-accent-red/30 text-accent-red border-accent-red/50 animate-pulse'
              : 'bg-accent-red/10 text-accent-red border-accent-red/20 hover:bg-accent-red/20'
          }`}
          title={primed ? 'Click again to confirm' : 'Kill all active sessions'}
        >
          <AlertOctagon size={16} />
          <span>{primed ? 'Confirm Stop' : 'Stop All'}</span>
        </button>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-elevated rounded-md transition-colors"
            title="Refresh Data"
            aria-label="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
