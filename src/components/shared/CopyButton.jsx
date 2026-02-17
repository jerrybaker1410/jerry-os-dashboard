import { useState, useCallback } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';

/**
 * Small copy-to-clipboard icon button with visual feedback.
 * Shows checkmark on success, uses toast for confirmation.
 */
export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [state, setState] = useState('idle'); // idle | copied | error
  const toast = useToast();

  const handleCopy = useCallback(async () => {
    if (state !== 'idle' || !text) return;

    try {
      const value = typeof text === 'function' ? text() : text;
      await navigator.clipboard.writeText(value);
      setState('copied');
      toast.success('Copied to clipboard');
      setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('error');
      toast.error('Failed to copy');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [text, state, toast]);

  const Icon = state === 'copied' ? Check : state === 'error' ? AlertCircle : Copy;
  const stateColor =
    state === 'copied'
      ? 'text-accent-green'
      : state === 'error'
      ? 'text-accent-red'
      : 'text-text-muted hover:text-text-secondary';

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={state !== 'idle'}
      className={`inline-flex items-center justify-center p-1 rounded transition-colors ${stateColor} ${className}`}
      title={state === 'copied' ? 'Copied!' : state === 'error' ? 'Copy failed' : label}
      aria-label={label}
    >
      <Icon size={14} />
    </button>
  );
}

/**
 * Inline copy value — displays text with a copy button next to it.
 */
export function CopyValue({ text, display, mono = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`text-sm text-text-secondary truncate ${mono ? 'font-data' : ''}`}>
        {display ?? text}
      </span>
      <CopyButton text={text} label={`Copy ${display || 'value'}`} />
    </span>
  );
}
