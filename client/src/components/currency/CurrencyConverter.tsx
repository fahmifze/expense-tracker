import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useExchangeRates, useConvertCurrency } from '../../hooks/useExchangeRates';

const CURRENCY_INFO: Record<string, { name: string; symbol: string; flag: string }> = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
};

export default function CurrencyConverter() {
  const { isDark } = useTheme();
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MYR');
  const [debouncedAmount, setDebouncedAmount] = useState(100);

  const { data: ratesData, isLoading: ratesLoading } = useExchangeRates();
  const { data: conversionData, isLoading: conversionLoading, isFetching } = useConvertCurrency(
    debouncedAmount,
    fromCurrency,
    toCurrency
  );

  // Debounce amount changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed = parseFloat(amount);
      if (!isNaN(parsed) && parsed > 0) {
        setDebouncedAmount(parsed);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [amount]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const currencies = Object.keys(CURRENCY_INFO);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-6 border-b border-inherit">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Currency Converter
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Convert between popular currencies
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Amount Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Amount
          </label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {CURRENCY_INFO[fromCurrency]?.symbol || '$'}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 text-lg rounded-lg border transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
              placeholder="Enter amount"
              min="0"
              step="any"
            />
          </div>
        </div>

        {/* Currency Selectors */}
        <div className="flex items-center gap-4">
          {/* From Currency */}
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors appearance-none cursor-pointer ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_INFO[code].flag} {code} - {CURRENCY_INFO[code].name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className={`mt-6 p-3 rounded-full transition-all ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Swap currencies"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* To Currency */}
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors appearance-none cursor-pointer ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_INFO[code].flag} {code} - {CURRENCY_INFO[code].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Display */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-700/50' : 'bg-primary-50'}`}>
          {ratesLoading ? (
            <div className="animate-pulse">
              <div className={`h-4 w-24 rounded mb-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
              <div className={`h-10 w-48 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
            </div>
          ) : fromCurrency === toCurrency ? (
            <div className="text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Select different currencies to convert
              </p>
            </div>
          ) : (
            <>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-primary-600'}`}>
                {CURRENCY_INFO[fromCurrency].flag} {formatNumber(debouncedAmount)} {fromCurrency} =
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                {conversionLoading || isFetching ? (
                  <div className={`animate-pulse h-10 w-48 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
                ) : (
                  <>
                    <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {CURRENCY_INFO[toCurrency].flag} {formatNumber(conversionData?.convertedAmount || 0)}
                    </span>
                    <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {toCurrency}
                    </span>
                  </>
                )}
              </div>
              {conversionData?.rate && (
                <p className={`text-sm mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  1 {fromCurrency} = {formatNumber(conversionData.rate, 4)} {toCurrency}
                </p>
              )}
            </>
          )}
        </div>

        {/* Last Updated */}
        {ratesData && (
          <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Rates updated: {new Date(ratesData.lastUpdated || Date.now()).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
