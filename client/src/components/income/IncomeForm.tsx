import { useState, useEffect } from 'react';
import { useIncomeCategories } from '../../hooks/useIncomes';
import { IncomeWithCategory } from '../../types/income.types';
import Modal from '../ui/Modal';

interface IncomeFormData {
  categoryId?: number;
  amount: number;
  description: string;
  incomeDate: string;
}

interface IncomeFormProps {
  income?: IncomeWithCategory;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncomeFormData) => void;
  isLoading: boolean;
}

export default function IncomeForm({ income, isOpen, onClose, onSubmit, isLoading }: IncomeFormProps) {
  const { data: categories } = useIncomeCategories();
  const [categoryId, setCategoryId] = useState(income?.categoryId || 0);
  const [amount, setAmount] = useState(income?.amount?.toString() || '');
  const [description, setDescription] = useState(income?.description || '');
  const [incomeDate, setIncomeDate] = useState(
    income?.incomeDate
      ? new Date(income.incomeDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (income) {
      setCategoryId(income.categoryId || 0);
      setAmount(income.amount.toString());
      setDescription(income.description || '');
      setIncomeDate(new Date(income.incomeDate).toISOString().split('T')[0]);
    }
  }, [income]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit({
      categoryId: categoryId || undefined,
      amount: parseFloat(amount),
      description,
      incomeDate,
    });
  };

  const resetForm = () => {
    setCategoryId(income?.categoryId || 0);
    setAmount(income?.amount?.toString() || '');
    setDescription(income?.description || '');
    setIncomeDate(
      income?.incomeDate
        ? new Date(income.incomeDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={income ? 'Edit Income' : 'Add Income'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Category (optional)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(parseInt(e.target.value))}
            className="input"
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
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
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
            placeholder="What is this income from?"
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
            disabled={isLoading || !amount}
          >
            {isLoading ? 'Saving...' : income ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
