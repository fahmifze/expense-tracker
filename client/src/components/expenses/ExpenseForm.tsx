import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { ExpenseWithCategory } from '../../types/expense.types';
import Modal from '../ui/Modal';

interface ExpenseFormData {
  categoryId: number;
  amount: number;
  description: string;
  expenseDate: string;
}

interface ExpenseFormProps {
  expense?: ExpenseWithCategory;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  isLoading: boolean;
}

export default function ExpenseForm({ expense, isOpen, onClose, onSubmit, isLoading }: ExpenseFormProps) {
  const { data: categories } = useCategories();
  const [categoryId, setCategoryId] = useState(expense?.categoryId || 0);
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [expenseDate, setExpenseDate] = useState(
    expense?.expenseDate
      ? new Date(expense.expenseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;
    onSubmit({
      categoryId,
      amount: parseFloat(amount),
      description,
      expenseDate,
    });
  };

  const resetForm = () => {
    setCategoryId(expense?.categoryId || 0);
    setAmount(expense?.amount?.toString() || '');
    setDescription(expense?.description || '');
    setExpenseDate(
      expense?.expenseDate
        ? new Date(expense.expenseDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={expense ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(parseInt(e.target.value))}
            className="input"
            required
          >
            <option value="">Select a category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[80px]"
            placeholder="What was this expense for?"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary"
            disabled={isLoading || !categoryId || !amount}
          >
            {isLoading ? 'Saving...' : expense ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
