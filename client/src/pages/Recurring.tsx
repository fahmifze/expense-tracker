import { useState } from 'react';
import {
  useRecurringRules,
  useUpcomingRecurring,
  useCreateRecurring,
  useUpdateRecurring,
  useDeleteRecurring,
  useToggleRecurring,
} from '../hooks/useRecurring';
import { RecurringRuleWithCategory, RecurringFilters } from '../types/recurring.types';
import { useAuth } from '../context/AuthContext';
import { useToast, LoadingSection } from '../components/ui';
import RecurringForm from '../components/recurring/RecurringForm';
import RecurringList from '../components/recurring/RecurringList';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Recurring() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const currency = user?.currency || 'MYR';

  const [filters, setFilters] = useState<RecurringFilters>({});
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  const activeFilters: RecurringFilters = {
    ...filters,
    type: typeFilter ? (typeFilter as 'expense' | 'income') : undefined,
    isActive: activeFilter ? activeFilter === 'true' : undefined,
  };

  const { data: rulesData, isLoading } = useRecurringRules(activeFilters);
  const { data: upcoming } = useUpcomingRecurring(7); // Next 7 days
  const createMutation = useCreateRecurring();
  const updateMutation = useUpdateRecurring();
  const deleteMutation = useDeleteRecurring();
  const toggleMutation = useToggleRecurring();

  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRuleWithCategory | undefined>();

  const handleCreate = (data: {
    type: 'expense' | 'income';
    categoryId: number;
    amount: number;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate?: string;
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
        showSuccess('Recurring rule created successfully');
      },
      onError: () => showError('Failed to create recurring rule'),
    });
  };

  const handleUpdate = (data: {
    type: 'expense' | 'income';
    categoryId: number;
    amount: number;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate?: string;
  }) => {
    if (!editingRule) return;
    updateMutation.mutate(
      { id: editingRule.id, data },
      {
        onSuccess: () => {
          setEditingRule(undefined);
          showSuccess('Recurring rule updated successfully');
        },
        onError: () => showError('Failed to update recurring rule'),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this recurring rule?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSuccess('Recurring rule deleted'),
        onError: () => showError('Failed to delete recurring rule'),
      });
    }
  };

  const handleToggle = (id: number) => {
    toggleMutation.mutate(id, {
      onSuccess: () => showSuccess('Recurring rule toggled'),
      onError: () => showError('Failed to toggle recurring rule'),
    });
  };

  const handleEdit = (rule: RecurringRuleWithCategory) => {
    setEditingRule(rule);
  };

  const rules = rulesData?.data || [];

  // Calculate totals
  const monthlyExpenses = rules
    .filter((r) => r.type === 'expense' && r.isActive)
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'weekly' ? 4 : r.frequency === 'daily' ? 30 : r.frequency === 'yearly' ? 1/12 : 1;
      return sum + r.amount * multiplier;
    }, 0);

  const monthlyIncome = rules
    .filter((r) => r.type === 'income' && r.isActive)
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'weekly' ? 4 : r.frequency === 'daily' ? 30 : r.frequency === 'yearly' ? 1/12 : 1;
      return sum + r.amount * multiplier;
    }, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recurring Transactions</h1>
          <p className="text-gray-500 mt-1">Manage automatic income and expenses</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Recurring
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Monthly Recurring Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses, currency)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Monthly Recurring Income</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(monthlyIncome, currency)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Net Monthly</p>
          <p className={`text-2xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(monthlyIncome - monthlyExpenses, currency)}
          </p>
        </div>
      </div>

      {/* Upcoming Transactions */}
      {upcoming && upcoming.length > 0 && (
        <div className="card mb-6 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming (Next 7 Days)</h2>
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: item.categoryColor }}
                  >
                    {item.categoryIcon || (item.type === 'expense' ? '-' : '+')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.categoryName}</p>
                    <p className="text-xs text-gray-500">
                      {item.daysUntil === 0 ? 'Today' : item.daysUntil === 1 ? 'Tomorrow' : `In ${item.daysUntil} days`}
                    </p>
                  </div>
                </div>
                <span className={`font-medium ${item.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="card">
        {isLoading ? (
          <LoadingSection />
        ) : (
          <RecurringList
            rules={rules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        )}
      </div>

      {/* Form Modal */}
      <RecurringForm
        isOpen={showForm || !!editingRule}
        recurring={editingRule}
        onClose={() => {
          setShowForm(false);
          setEditingRule(undefined);
        }}
        onSubmit={editingRule ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
