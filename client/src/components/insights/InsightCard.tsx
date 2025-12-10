import { Insight } from '../../types/insights.types';

interface InsightCardProps {
  insight: Insight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const getTypeStyles = () => {
    switch (insight.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'alert':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconBgColor = () => {
    switch (insight.type) {
      case 'success':
        return 'bg-green-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'alert':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className={`p-4 rounded-lg border ${getTypeStyles()}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getIconBgColor()}`}>
          <span className="text-lg">{insight.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{insight.title}</h4>
          <p className="text-sm opacity-90 mt-1">{insight.message}</p>
          {insight.change !== undefined && (
            <span className={`inline-block mt-2 text-sm font-medium px-2 py-1 rounded ${
              insight.change >= 0 ? 'bg-white/50' : 'bg-white/50'
            }`}>
              {formatChange(insight.change)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
