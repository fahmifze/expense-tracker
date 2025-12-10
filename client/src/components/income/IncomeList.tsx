import { IncomeWithCategory } from '../../types/income.types';

interface IncomeListProps {
  incomes: IncomeWithCategory[];
  onEdit: (income: IncomeWithCategory) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function IncomeList({ incomes, onEdit, onDelete, isLoading }: IncomeListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No income records found. Add your first income!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incomes.map((income) => (
        <div
          key={income.id}
          className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: income.categoryColor || '#10B981' }}
            >
              {income.categoryIcon || '$'}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {income.categoryName || 'Uncategorized'}
              </p>
              {income.description && (
                <p className="text-sm text-gray-500">{income.description}</p>
              )}
              <p className="text-xs text-gray-400">{formatDate(income.incomeDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-green-600">
              +{formatCurrency(income.amount)}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => onEdit(income)}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(income.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
