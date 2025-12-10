import { useState } from 'react';
import {
  useBudgetsWithStatus,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from '../hooks/useBudgets';
import { BudgetWithStatus } from '../types/budget.types';
import { useToast, LoadingSection } from '../components/ui';
import BudgetForm from '../components/budget/BudgetForm';
import BudgetCard from '../components/budget/BudgetCard';

export default function Budget() {
  const { showSuccess, showError } = useToast();
  const { data: budgets, isLoading } = useBudgetsWithStatus();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithStatus | undefined>();

  const handleCreate = (data: {
    categoryId: number | null;
    amount: number;
    period: 'weekly' | 'monthly' | 'yearly';
    alertAt80: boolean;
    alertAt100: boolean;
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
        showSuccess('Budget created successfully');
      },
      onError: (error: Error) => showError(error.message || 'Failed to create budget'),
    });
  };

  const handleUpdate = (data: {
    categoryId: number | null;
    amount: number;
    period: 'weekly' | 'monthly' | 'yearly';
    alertAt80: boolean;
    alertAt100: boolean;
  }) => {
    if (!editingBudget) return;
    updateMutation.mutate(
      { id: editingBudget.id, data },
      {
        onSuccess: () => {
          setEditingBudget(undefined);
          showSuccess('Budget updated successfully');
        },
        onError: (error: Error) => showError(error.message || 'Failed to update budget'),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSuccess('Budget deleted'),
        onError: () => showError('Failed to delete budget'),
      });
    }
  };

  const handleEdit = (budget: BudgetWithStatus) => {
    setEditingBudget(budget);
  };

  // Separate overall budget from category budgets
  const overallBudget = budgets?.find((b) => !b.categoryId);
  const categoryBudgets = budgets?.filter((b) => b.categoryId) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>
          <p className="text-gray-500 mt-1">Set spending limits and track your progress</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Budget
        </button>
      </div>

      {isLoading ? (
        <LoadingSection />
      ) : (
        <div className="space-y-6">
          {/* Overall Budget */}
          {overallBudget && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Overall Budget</h2>
              <BudgetCard
                budget={overallBudget}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}

          {/* Category Budgets */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Category Budgets</h2>
            {categoryBudgets.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-gray-500 mb-4">No category budgets set up yet</p>
                <button onClick={() => setShowForm(true)} className="btn-secondary">
                  Create your first budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {budgets && budgets.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
                  <p className="text-sm text-gray-500">Total Budgets</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {budgets.filter((b) => !b.isWarning && !b.isOverBudget).length}
                  </p>
                  <p className="text-sm text-gray-500">On Track</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {budgets.filter((b) => b.isWarning).length}
                  </p>
                  <p className="text-sm text-gray-500">Near Limit</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {budgets.filter((b) => b.isOverBudget).length}
                  </p>
                  <p className="text-sm text-gray-500">Exceeded</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <BudgetForm
        isOpen={showForm || !!editingBudget}
        budget={editingBudget}
        onClose={() => {
          setShowForm(false);
          setEditingBudget(undefined);
        }}
        onSubmit={editingBudget ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
