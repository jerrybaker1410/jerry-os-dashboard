import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component with icon, title, subtitle, and optional action.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  subtitle,
  action,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center mb-3">
        <Icon size={20} className="text-text-muted" />
      </div>
      <h3 className="text-sm font-medium text-text-secondary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-text-muted max-w-xs">{subtitle}</p>}
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-accent-blue bg-accent-blue/10 border border-accent-blue/20 rounded-md hover:bg-accent-blue/20 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}
