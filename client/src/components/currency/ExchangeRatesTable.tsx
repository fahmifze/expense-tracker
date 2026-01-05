import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';

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

interface ExchangeRatesTableProps {
  baseCurrency?: string;
}

export default function ExchangeRatesTable({ baseCurrency: initialBase = 'USD' }: ExchangeRatesTableProps) {
  const { isDark } = useTheme();
  const [baseCurrency, setBaseCurrency] = useState(initialBase);
  const { data, isLoading, error } = useExchangeRates();

  if (isLoading) {
    return (
      <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6 border-b border-inherit">
          <div className={`h-6 w-48 rounded animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
        <div className="p-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-14 rounded mb-2 animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={`text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          Failed to load exchange rates
        </p>
      </div>
    );
  }

  const currencies = Object.keys(CURRENCY_INFO);

  // Calculate rates relative to selected base currency
  const getRate = (targetCurrency: string): number => {
    if (baseCurrency === 'USD') {
      return data.rates[targetCurrency] || 0;
    }
    // Convert through USD
    const baseToUsd = 1 / (data.rates[baseCurrency] || 1);
    return baseToUsd * (data.rates[targetCurrency] || 0);
  };

  const formatRate = (rate: number): string => {
    if (rate >= 1000) {
      return rate.toFixed(2);
    } else if (rate >= 1) {
      return rate.toFixed(4);
    } else {
      return rate.toFixed(6);
    }
  };

  return (
    <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-6 border-b border-inherit">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Exchange Rates
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Live rates for popular currencies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Base:
            </span>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_INFO[code].flag} {code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Currency
              </th>
              <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Rate (1 {baseCurrency})
              </th>
              <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Inverse (1 {`{Currency}`})
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {currencies
              .filter((code) => code !== baseCurrency)
              .map((code) => {
                const rate = getRate(code);
                const inverseRate = rate > 0 ? 1 / rate : 0;
                const info = CURRENCY_INFO[code];

                return (
                  <tr
                    key={code}
                    className={`transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{info.flag}</span>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {code}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {info.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {info.symbol}
                      </span>{' '}
                      {formatRate(rate)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {CURRENCY_INFO[baseCurrency].symbol}
                      </span>{' '}
                      {formatRate(inverseRate)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Footer with timestamp */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Data provided by Open Exchange Rates • Last updated: {new Date(data.lastUpdated || Date.now()).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
