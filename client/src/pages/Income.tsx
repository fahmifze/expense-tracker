import { useState, useMemo } from 'react';
import {
  useIncomes,
  useIncomeStats,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
} from '../hooks/useIncomes';
import { IncomeWithCategory, IncomeFilters } from '../types/income.types';
import { useIncomeCategories } from '../hooks/useIncomes';
import { useAuth } from '../context/AuthContext';
import { useToast, LoadingSection } from '../components/ui';
import IncomeForm from '../components/income/IncomeForm';
import IncomeList from '../components/income/IncomeList';
import { formatCurrency } from '../utils/formatters';

export default function Income() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const currency = user?.currency || 'MYR';

  // Filters state
  const [filters, setFilters] = useState<IncomeFilters>({
    page: 1,
    limit: 10,
    sortBy: 'incomeDate',
    sortOrder: 'desc',
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Build filters for API
  const activeFilters = useMemo(() => {
    const f: IncomeFilters = { ...filters };
    if (categoryFilter) f.categoryId = parseInt(categoryFilter);
    if (searchFilter) f.search = searchFilter;
    if (dateRange.start) f.startDate = dateRange.start;
    if (dateRange.end) f.endDate = dateRange.end;
    return f;
  }, [filters, categoryFilter, searchFilter, dateRange]);

  const { data: incomesData, isLoading } = useIncomes(activeFilters);
  const { data: stats } = useIncomeStats();
  const { data: categories } = useIncomeCategories();
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeWithCategory | undefined>();

  const handleCreate = (data: {
    categoryId?: number;
    amount: number;
    description: string;
    incomeDate: string;
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
        showSuccess('Income added successfully');
      },
      onError: () => showError('Failed to add income'),
    });
  };

  const handleUpdate = (data: {
    categoryId?: number;
    amount: number;
    description: string;
    incomeDate: string;
  }) => {
    if (!editingIncome) return;
    updateMutation.mutate(
      { id: editingIncome.id, data },
      {
        onSuccess: () => {
          setEditingIncome(undefined);
          showSuccess('Income updated successfully');
        },
        onError: () => showError('Failed to update income'),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this income?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSuccess('Income deleted'),
        onError: () => showError('Failed to delete income'),
      });
    }
  };

  const handleEdit = (income: IncomeWithCategory) => {
    setEditingIncome(income);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setSearchFilter('');
    setDateRange({ start: '', end: '' });
    setFilters({ page: 1, limit: 10, sortBy: 'incomeDate', sortOrder: 'desc' });
  };

  const incomes = incomesData?.data || [];
  const pagination = incomesData?.pagination;
  const hasFilters = categoryFilter || searchFilter || dateRange.start || dateRange.end;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your earnings and income sources</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Income
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats?.monthlyTotal || 0, currency)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">This Year</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats?.yearlyTotal || 0, currency)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Top Source</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats?.categoryBreakdown?.[0]?.categoryName || 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setFilters((f) => ({ ...f, page: 1 }));
              }}
              className="input"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => {
                setDateRange((d) => ({ ...d, start: e.target.value }));
                setFilters((f) => ({ ...f, page: 1 }));
              }}
              className="input"
            />
          </div>

          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => {
                setDateRange((d) => ({ ...d, end: e.target.value }));
                setFilters((f) => ({ ...f, page: 1 }));
              }}
              className="input"
            />
          </div>

          <div>
            <label className="label">Search</label>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setFilters((f) => ({ ...f, page: 1 }));
              }}
              className="input"
              placeholder="Search description..."
            />
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4">
            <button onClick={clearFilters} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Income List */}
      <div className="card">
        {isLoading ? (
          <LoadingSection />
        ) : incomes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No income records found</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add your first income
            </button>
          </div>
        ) : (
          <>
            <IncomeList
              incomes={incomes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} records
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm dark:text-gray-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <IncomeForm
        isOpen={showForm || !!editingIncome}
        income={editingIncome}
        onClose={() => {
          setShowForm(false);
          setEditingIncome(undefined);
        }}
        onSubmit={editingIncome ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
