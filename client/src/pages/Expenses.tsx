import { useState, useMemo } from 'react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { ExpenseWithCategory, ExpenseFilters } from '../types/expense.types';
import { useAuth } from '../context/AuthContext';
import { useToast, LoadingSection } from '../components/ui';
import { ExpenseForm } from '../components/expenses';
import { formatCurrency, formatDate } from '../utils/formatters';
import * as exportService from '../services/export.service';

export default function Expenses() {
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const { showSuccess, showError } = useToast();
  const currency = user?.currency || 'USD';

  // Filters state
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
    sortBy: 'expenseDate',
    sortOrder: 'desc',
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Build filters for API
  const activeFilters = useMemo(() => {
    const f: ExpenseFilters = { ...filters };
    if (categoryFilter) f.categoryId = parseInt(categoryFilter);
    if (searchFilter) f.search = searchFilter;
    if (dateRange.start) f.startDate = dateRange.start;
    if (dateRange.end) f.endDate = dateRange.end;
    return f;
  }, [filters, categoryFilter, searchFilter, dateRange]);

  const { data: expensesData, isLoading } = useExpenses(activeFilters);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportService.exportCSV({
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
      });
      showSuccess('CSV exported successfully');
    } catch {
      showError('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportService.exportPDF({
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
      });
      showSuccess('PDF exported successfully');
    } catch {
      showError('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreate = (data: { categoryId: number; amount: number; description: string; expenseDate: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
        showSuccess('Expense added successfully');
      },
      onError: () => showError('Failed to add expense'),
    });
  };

  const handleUpdate = (data: { categoryId: number; amount: number; description: string; expenseDate: string }) => {
    if (!editingExpense) return;
    updateMutation.mutate(
      { id: editingExpense.id, data },
      {
        onSuccess: () => {
          setEditingExpense(undefined);
          showSuccess('Expense updated successfully');
        },
        onError: () => showError('Failed to update expense'),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSuccess('Expense deleted'),
        onError: () => showError('Failed to delete expense'),
      });
    }
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setSearchFilter('');
    setDateRange({ start: '', end: '' });
    setFilters({ page: 1, limit: 10, sortBy: 'expenseDate', sortOrder: 'desc' });
  };

  const expenses = expensesData?.data || [];
  const pagination = expensesData?.pagination;
  const hasFilters = categoryFilter || searchFilter || dateRange.start || dateRange.end;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="btn-secondary text-sm"
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn-secondary text-sm"
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add Expense
          </button>
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

      {/* Expenses List */}
      <div className="card">
        {isLoading ? (
          <LoadingSection />
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No expenses found</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add your first expense
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                        {formatDate(expense.expenseDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: expense.categoryColor }}
                          >
                            {expense.categoryIcon?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{expense.categoryName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {expense.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(expense.amount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} expenses
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

      {/* Create/Edit Form Modal */}
      <ExpenseForm
        isOpen={showForm || !!editingExpense}
        expense={editingExpense}
        onClose={() => {
          setShowForm(false);
          setEditingExpense(undefined);
        }}
        onSubmit={editingExpense ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
