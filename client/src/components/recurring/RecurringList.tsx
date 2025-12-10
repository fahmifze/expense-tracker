import { RecurringRuleWithCategory } from '../../types/recurring.types';

interface RecurringListProps {
  rules: RecurringRuleWithCategory[];
  onEdit: (rule: RecurringRuleWithCategory) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  isLoading?: boolean;
}

export default function RecurringList({ rules, onEdit, onDelete, onToggle, isLoading }: RecurringListProps) {
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

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return frequency;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recurring transactions set up. Add one to automate your tracking!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`card p-4 flex items-center justify-between transition-all ${
            !rule.isActive ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: rule.categoryColor }}
            >
              {rule.categoryIcon || (rule.type === 'expense' ? '-' : '+')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{rule.categoryName}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  rule.type === 'expense'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {rule.type}
                </span>
                {!rule.isActive && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    Paused
                  </span>
                )}
              </div>
              {rule.description && (
                <p className="text-sm text-gray-500">{rule.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {getFrequencyLabel(rule.frequency)} | Next: {formatDate(rule.nextOccurrence)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-lg font-semibold ${
              rule.type === 'expense' ? 'text-red-600' : 'text-green-600'
            }`}>
              {rule.type === 'expense' ? '-' : '+'}{formatCurrency(rule.amount)}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => onToggle(rule.id)}
                className={`p-2 rounded-lg transition-colors ${
                  rule.isActive
                    ? 'text-green-500 hover:text-green-700 hover:bg-green-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={rule.isActive ? 'Pause' : 'Activate'}
              >
                {rule.isActive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => onEdit(rule)}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(rule.id)}
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
