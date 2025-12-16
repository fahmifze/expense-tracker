import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCreateAlert, useStockQuote } from '../../hooks/useStocks';
import { StockSearchResult } from '../../types/stock.types';
import StockSearch from './StockSearch';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStock?: { symbol: string; name: string } | null;
}

export default function AlertModal({ isOpen, onClose, preselectedStock }: AlertModalProps) {
  const { isDark } = useTheme();
  const createAlert = useCreateAlert();

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    conditionType: 'above' as 'above' | 'below',
    targetPrice: '',
  });

  const { data: quote } = useStockQuote(formData.symbol || undefined);

  useEffect(() => {
    if (preselectedStock) {
      setFormData((prev) => ({
        ...prev,
        symbol: preselectedStock.symbol,
        name: preselectedStock.name,
      }));
    }
  }, [preselectedStock]);

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
      await createAlert.mutateAsync({
        symbol: formData.symbol,
        name: formData.name,
        conditionType: formData.conditionType,
        targetPrice: parseFloat(formData.targetPrice),
      });

      onClose();
      setFormData({
        symbol: '',
        name: '',
        conditionType: 'above',
        targetPrice: '',
      });
    } catch {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  const currentPrice = quote?.price;

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
              Create Price Alert
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

            {/* Current Price */}
            {currentPrice && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Current Price</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Condition Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Alert when price goes
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, conditionType: 'above' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    formData.conditionType === 'above'
                      ? 'bg-green-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Above
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, conditionType: 'below' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    formData.conditionType === 'below'
                      ? 'bg-red-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Below
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Target Price
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetPrice: e.target.value }))}
                  required
                  className={`w-full pl-7 pr-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="0.00"
                />
              </div>
              {currentPrice && formData.targetPrice && (
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formData.conditionType === 'above'
                    ? `Alert when price rises ${((parseFloat(formData.targetPrice) - currentPrice) / currentPrice * 100).toFixed(1)}% from current`
                    : `Alert when price drops ${((currentPrice - parseFloat(formData.targetPrice)) / currentPrice * 100).toFixed(1)}% from current`
                  }
                </p>
              )}
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
                disabled={!formData.symbol || !formData.targetPrice || createAlert.isPending}
                className="flex-1 py-2 px-4 rounded-lg font-medium bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAlert.isPending ? 'Creating...' : 'Create Alert'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
