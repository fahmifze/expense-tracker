import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useIncomeCategories } from '../../hooks/useIncomes';
import { RecurringRuleWithCategory, RecurringType, RecurringFrequency } from '../../types/recurring.types';
import Modal from '../ui/Modal';

interface RecurringFormData {
  type: RecurringType;
  categoryId: number;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
}

interface RecurringFormProps {
  recurring?: RecurringRuleWithCategory;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringFormData) => void;
  isLoading: boolean;
}

export default function RecurringForm({ recurring, isOpen, onClose, onSubmit, isLoading }: RecurringFormProps) {
  const { data: expenseCategories } = useCategories();
  const { data: incomeCategories } = useIncomeCategories();

  const [type, setType] = useState<RecurringType>(recurring?.type || 'expense');
  const [categoryId, setCategoryId] = useState(recurring?.categoryId || 0);
  const [amount, setAmount] = useState(recurring?.amount?.toString() || '');
  const [description, setDescription] = useState(recurring?.description || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(recurring?.frequency || 'monthly');
  const [startDate, setStartDate] = useState(
    recurring?.startDate
      ? new Date(recurring.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    recurring?.endDate
      ? new Date(recurring.endDate).toISOString().split('T')[0]
      : ''
  );

  useEffect(() => {
    if (recurring) {
      setType(recurring.type);
      setCategoryId(recurring.categoryId);
      setAmount(recurring.amount.toString());
      setDescription(recurring.description || '');
      setFrequency(recurring.frequency);
      setStartDate(new Date(recurring.startDate).toISOString().split('T')[0]);
      setEndDate(recurring.endDate ? new Date(recurring.endDate).toISOString().split('T')[0] : '');
    }
  }, [recurring]);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;
    onSubmit({
      type,
      categoryId,
      amount: parseFloat(amount),
      description,
      frequency,
      startDate,
      endDate: endDate || undefined,
    });
  };

  const resetForm = () => {
    setType(recurring?.type || 'expense');
    setCategoryId(recurring?.categoryId || 0);
    setAmount(recurring?.amount?.toString() || '');
    setDescription(recurring?.description || '');
    setFrequency(recurring?.frequency || 'monthly');
    setStartDate(
      recurring?.startDate
        ? new Date(recurring.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setEndDate(recurring?.endDate ? new Date(recurring.endDate).toISOString().split('T')[0] : '');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeChange = (newType: RecurringType) => {
    setType(newType);
    setCategoryId(0); // Reset category when type changes
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={recurring ? 'Edit Recurring' : 'Add Recurring'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                type === 'expense'
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                type === 'income'
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Income
            </button>
          </div>
        </div>

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
          <label className="label">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
            className="input"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
              min={startDate}
            />
          </div>
        </div>

        <div>
          <label className="label">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[80px]"
            placeholder="e.g., Monthly rent payment"
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
            {isLoading ? 'Saving...' : recurring ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
