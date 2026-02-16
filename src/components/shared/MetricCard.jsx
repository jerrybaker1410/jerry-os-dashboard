import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ label, value, subValue, trend, icon: Icon, accentColor = 'accent-blue' }) {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-accent-green' : trend === 'down' ? 'text-accent-red' : 'text-text-muted';
  const TrendIcon = trendIcon;

  return (
    <div className="bg-surface border border-border-default rounded-lg p-4 hover:border-border-hover transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-sm">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-md bg-${accentColor}/10`}>
            <Icon size={16} className={`text-${accentColor}`} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-text-primary font-data">{value}</span>
        {subValue && (
          <span className="text-text-muted text-xs mb-1 flex items-center gap-1">
            {trend && <TrendIcon size={12} className={trendColor} />}
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
