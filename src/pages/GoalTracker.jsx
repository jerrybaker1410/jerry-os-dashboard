import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchGoals } from '../lib/api';
import PageHeader from '../components/layout/PageHeader';
import { SkeletonTable } from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { CopyValue } from '../components/shared/CopyButton';

function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });
}

function parseGoals(content) {
  if (!content) return [];
  const lines = content.split('\n');
  const goals = [];
  let currentGoal = null;

  for (const line of lines) {
    // Match goal headers like "## 1. Goal Title" or "### Goal Title"
    const goalMatch = line.match(/^##\s+(?:\d+\.\s*)?(.+)/);
    if (goalMatch) {
      if (currentGoal) goals.push(currentGoal);
      currentGoal = {
        title: goalMatch[1].trim(),
        details: [],
        metrics: [],
      };
      continue;
    }

    if (!currentGoal) continue;

    // Match bullet points as details
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      const text = bulletMatch[1].trim();
      // Check if it looks like a metric (contains numbers/percentages)
      if (/\d+[%xX]|\d+\/\d+|\$\d+/.test(text)) {
        currentGoal.metrics.push(text);
      } else {
        currentGoal.details.push(text);
      }
    }
  }

  if (currentGoal) goals.push(currentGoal);
  return goals;
}

export default function GoalTracker() {
  const { data, isLoading, refetch } = useGoals();

  if (isLoading) return <SkeletonTable rows={5} cols={3} />;

  const goals = parseGoals(data?.content);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goal Tracker"
        subtitle="Q1 2026 business goals from brain/goals/goals.md"
        onRefresh={refetch}
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          subtitle={data?.error || 'Goals file could not be parsed'}
        />
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => (
            <div key={i} className="bg-surface border border-border-default rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default">
                <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <Target size={16} className="text-accent-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary">{goal.title}</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue font-medium">
                  Goal {i + 1}
                </span>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Metrics */}
                {goal.metrics.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1">
                      <TrendingUp size={10} /> Key Metrics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {goal.metrics.map((metric, j) => (
                        <span key={j} className="text-xs px-2.5 py-1 rounded bg-elevated text-text-secondary">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details */}
                {goal.details.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1">
                      <CheckCircle size={10} /> Details
                    </p>
                    <ul className="space-y-1.5">
                      {goal.details.map((detail, j) => (
                        <li key={j} className="text-xs text-text-secondary flex items-start gap-2">
                          <span className="text-text-muted mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw content fallback */}
      {data?.content && (
        <details className="bg-surface border border-border-default rounded-lg">
          <summary className="px-4 py-3 text-xs text-text-muted cursor-pointer hover:text-text-secondary">
            View raw goals.md
          </summary>
          <div className="border-t border-border-default">
            <div className="flex justify-end px-4 py-2">
              <CopyValue text={data.content} display="Copy" mono={false} />
            </div>
            <pre className="px-4 pb-4 text-xs text-text-secondary font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
              {data.content}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
