import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'border-accent-green/40 bg-accent-green/10 text-accent-green',
  error: 'border-accent-red/40 bg-accent-red/10 text-accent-red',
  warning: 'border-accent-yellow/40 bg-accent-yellow/10 text-accent-yellow',
  info: 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue',
};

let nextId = 0;

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  const color = COLORS[toast.type] || COLORS.info;
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    if (toast.duration === 0) return; // persistent
    const timer = setTimeout(dismiss, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.duration, dismiss]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm max-w-sm transition-all duration-200 ${color} ${
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-toast-in'
      }`}
      role="alert"
    >
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-medium text-text-primary">{toast.title}</p>
        )}
        <p className={`text-sm ${toast.title ? 'text-text-secondary' : 'text-text-primary'}`}>
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, options = {}) => {
    const id = ++nextId;
    const newToast = {
      id,
      message,
      type: options.type || 'info',
      title: options.title || null,
      duration: options.duration ?? 3000,
    };
    setToasts((prev) => [...prev.slice(-4), newToast]); // max 5 toasts
    return id;
  }, []);

  const success = useCallback((msg, opts) => toast(msg, { ...opts, type: 'success' }), [toast]);
  const error = useCallback((msg, opts) => toast(msg, { ...opts, type: 'error' }), [toast]);
  const warning = useCallback((msg, opts) => toast(msg, { ...opts, type: 'warning' }), [toast]);
  const info = useCallback((msg, opts) => toast(msg, { ...opts, type: 'info' }), [toast]);

  const value = { toast, success, error, warning, info, dismiss };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — bottom right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
