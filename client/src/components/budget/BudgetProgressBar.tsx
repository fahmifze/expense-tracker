interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  percentage: number;
  isWarning: boolean;
  isOverBudget: boolean;
}

export default function BudgetProgressBar({
  spent,
  budget,
  percentage,
  isWarning,
  isOverBudget,
}: BudgetProgressBarProps) {
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {formatCurrency(spent)} spent
        </span>
        <span className="text-gray-600">
          {formatCurrency(budget)} budget
        </span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${
          isOverBudget ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {percentage.toFixed(1)}% used
        </span>
        <span className="text-sm text-gray-500">
          {formatCurrency(budget - spent)} remaining
        </span>
      </div>
    </div>
  );
}
