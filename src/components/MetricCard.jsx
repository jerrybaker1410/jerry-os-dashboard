import { cn } from '../lib/utils';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue', className }) {
  const colorMap = {
    green: 'text-neon-green border-neon-green/20 glow-green',
    blue: 'text-neon-blue border-neon-blue/20 glow-blue',
    purple: 'text-neon-purple border-neon-purple/20 glow-purple',
    orange: 'text-neon-orange border-neon-orange/20 glow-orange',
  };

  const iconColorMap = {
    green: 'text-neon-green bg-neon-green/10',
    blue: 'text-neon-blue bg-neon-blue/10',
    purple: 'text-neon-purple bg-neon-purple/10',
    orange: 'text-neon-orange bg-neon-orange/10',
  };

  return (
    <div className={cn('card p-5', colorMap[color], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-jerry-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-jerry-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg', iconColorMap[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
