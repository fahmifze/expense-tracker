import { Insight } from '../../types/insights.types';
import DynamicIcon from '../ui/DynamicIcon';

interface InsightCardProps {
  insight: Insight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const getTypeStyles = () => {
    switch (insight.type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          iconBg: 'bg-green-100 text-green-600',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconBg: 'bg-yellow-100 text-yellow-600',
        };
      case 'alert':
        return {
          container: 'bg-red-50 border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          iconBg: 'bg-red-100 text-red-600',
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconBg: 'bg-blue-100 text-blue-600',
        };
    }
  };

  const formatChange = (change: number) => {
    const safeChange = change ?? 0;
    const sign = safeChange >= 0 ? '+' : '';
    return `${sign}${safeChange.toFixed(1)}%`;
  };

  const styles = getTypeStyles();

  return (
    <div className={`p-4 rounded-lg border ${styles.container}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <DynamicIcon name={insight.icon || 'info'} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${styles.title}`}>{insight.title}</h4>
          <p className={`text-sm mt-1 ${styles.message}`}>{insight.message}</p>
          {insight.change !== undefined && (
            <span className={`inline-block mt-2 text-sm font-medium px-2 py-1 rounded bg-white/50 ${styles.title}`}>
              {formatChange(insight.change)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
