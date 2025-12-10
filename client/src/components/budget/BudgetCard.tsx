import { BudgetWithStatus } from '../../types/budget.types';
import BudgetProgressBar from './BudgetProgressBar';

interface BudgetCardProps {
  budget: BudgetWithStatus;
  onEdit: (budget: BudgetWithStatus) => void;
  onDelete: (id: number) => void;
}

export default function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return period;
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {budget.categoryColor ? (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
              style={{ backgroundColor: budget.categoryColor }}
            >
              {budget.categoryIcon || '$'}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-lg">
              $
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {budget.categoryName || 'Overall Budget'}
            </h3>
            <p className="text-sm text-gray-500">{getPeriodLabel(budget.period)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(budget)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <BudgetProgressBar
        spent={budget.spent}
        budget={budget.amount}
        percentage={budget.percentage}
        isWarning={budget.isWarning}
        isOverBudget={budget.isOverBudget}
      />

      {(budget.isWarning || budget.isOverBudget) && (
        <div className={`p-2 rounded-lg text-sm ${
          budget.isOverBudget ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {budget.isOverBudget
            ? 'Budget exceeded!'
            : 'Approaching budget limit'
          }
        </div>
      )}
    </div>
  );
}
