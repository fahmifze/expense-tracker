import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAddTransaction } from '../../hooks/useStocks';
import { StockSearchResult } from '../../types/stock.types';
import StockSearch from './StockSearch';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStock?: { symbol: string; name: string } | null;
  defaultType?: 'buy' | 'sell';
}

export default function TransactionModal({
  isOpen,
  onClose,
  preselectedStock,
  defaultType = 'buy',
}: TransactionModalProps) {
  const { isDark } = useTheme();
  const addTransaction = useAddTransaction();

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: defaultType as 'buy' | 'sell',
    quantity: '',
    price: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (preselectedStock) {
      setFormData((prev) => ({
        ...prev,
        symbol: preselectedStock.symbol,
        name: preselectedStock.name,
      }));
    }
  }, [preselectedStock]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, type: defaultType }));
  }, [defaultType]);

  const handleStockSelect = (stock: StockSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      symbol: stock.symbol,
      name: stock.name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addTransaction.mutateAsync({
        symbol: formData.symbol,
        name: formData.name,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        transactionDate: formData.transactionDate,
        notes: formData.notes || undefined,
      });

      onClose();
      setFormData({
        symbol: '',
        name: '',
        type: 'buy',
        quantity: '',
        price: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  const totalValue = parseFloat(formData.quantity || '0') * parseFloat(formData.price || '0');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div
          className={`relative w-full max-w-md rounded-lg shadow-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add Transaction
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Stock Search */}
            {!preselectedStock && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Stock
                </label>
                <StockSearch onSelect={handleStockSelect} placeholder="Search for a stock..." />
                {formData.symbol && (
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Selected: {formData.symbol} - {formData.name}
                  </p>
                )}
              </div>
            )}

            {preselectedStock && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.symbol}
                </span>
                <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formData.name}
                </span>
              </div>
            )}

            {/* Transaction Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'buy' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    formData.type === 'buy'
                      ? 'bg-green-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'sell' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    formData.type === 'sell'
                      ? 'bg-red-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Shares
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                  required
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price per Share
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  required
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Total */}
            {totalValue > 0 && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Total</span>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Date
              </label>
              <input
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, transactionDate: e.target.value }))}
                required
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                } focus:outline-none focus:ring-1 focus:ring-primary-500`}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                } focus:outline-none focus:ring-1 focus:ring-primary-500`}
                placeholder="Add notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.symbol || !formData.quantity || !formData.price || addTransaction.isPending}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.type === 'buy'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addTransaction.isPending ? 'Saving...' : formData.type === 'buy' ? 'Buy' : 'Sell'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
