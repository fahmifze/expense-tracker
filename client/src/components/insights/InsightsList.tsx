import { Insight } from '../../types/insights.types';
import InsightCard from './InsightCard';

interface InsightsListProps {
  insights: Insight[];
  isLoading?: boolean;
  maxItems?: number;
}

export default function InsightsList({ insights, isLoading, maxItems }: InsightsListProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No insights available yet.</p>
        <p className="text-sm mt-1">Add more transactions to get personalized insights!</p>
      </div>
    );
  }

  const displayInsights = maxItems ? insights.slice(0, maxItems) : insights;

  return (
    <div className="space-y-3">
      {displayInsights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
