import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { BudgetWithStatus, BudgetPeriod } from '../../types/budget.types';
import Modal from '../ui/Modal';

interface BudgetFormData {
  categoryId: number | null;
  amount: number;
  period: BudgetPeriod;
  alertAt80: boolean;
  alertAt100: boolean;
}

interface BudgetFormProps {
  budget?: BudgetWithStatus;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => void;
  isLoading: boolean;
}

export default function BudgetForm({ budget, isOpen, onClose, onSubmit, isLoading }: BudgetFormProps) {
  const { data: categories } = useCategories();
  const [categoryId, setCategoryId] = useState<number | null>(budget?.categoryId ?? null);
  const [amount, setAmount] = useState(budget?.amount?.toString() || '');
  const [period, setPeriod] = useState<BudgetPeriod>(budget?.period || 'monthly');
  const [alertAt80, setAlertAt80] = useState(budget?.alertAt80 ?? true);
  const [alertAt100, setAlertAt100] = useState(budget?.alertAt100 ?? true);

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.categoryId);
      setAmount(budget.amount.toString());
      setPeriod(budget.period);
      setAlertAt80(budget.alertAt80);
      setAlertAt100(budget.alertAt100);
    }
  }, [budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit({
      categoryId,
      amount: parseFloat(amount),
      period,
      alertAt80,
      alertAt100,
    });
  };

  const resetForm = () => {
    setCategoryId(budget?.categoryId ?? null);
    setAmount(budget?.amount?.toString() || '');
    setPeriod(budget?.period || 'monthly');
    setAlertAt80(budget?.alertAt80 ?? true);
    setAlertAt100(budget?.alertAt100 ?? true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={budget ? 'Edit Budget' : 'Add Budget'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Category (optional - leave empty for overall budget)</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
            className="input"
          >
            <option value="">Overall Budget</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Budget Amount</label>
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
          <label className="label">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            className="input"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="label">Alerts</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alertAt80"
              checked={alertAt80}
              onChange={(e) => setAlertAt80(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="alertAt80" className="text-sm">
              Alert at 80% of budget
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alertAt100"
              checked={alertAt100}
              onChange={(e) => setAlertAt100(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="alertAt100" className="text-sm">
              Alert when budget exceeded
            </label>
          </div>
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
            {isLoading ? 'Saving...' : budget ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
