import { useTheme } from '../context/ThemeContext';
import { useRateLimitStatus, useExchangeRates } from '../hooks/useExchangeRates';
import { CurrencyConverter, ExchangeRatesTable } from '../components/currency';

export default function CurrencyExchange() {
  const { isDark } = useTheme();
  const { data: rateLimitStatus } = useRateLimitStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Currency Exchange
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Convert currencies and view live exchange rates
        </p>
      </div>

      {/* API Status Banner (if low on requests) */}
      {rateLimitStatus && rateLimitStatus.remaining < 10 && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isDark ? 'bg-yellow-900/20 border-yellow-700 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">
              API requests running low: {rateLimitStatus.remaining} remaining today
            </span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <CurrencyConverter />
        </div>

        {/* Exchange Rates Table - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ExchangeRatesTable />
        </div>
      </div>

      {/* Quick Reference Cards */}
      <div className="mt-6">
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Quick Reference
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <QuickRateCard from="USD" to="MYR" isDark={isDark} />
          <QuickRateCard from="USD" to="EUR" isDark={isDark} />
          <QuickRateCard from="USD" to="GBP" isDark={isDark} />
          <QuickRateCard from="USD" to="SGD" isDark={isDark} />
          <QuickRateCard from="USD" to="JPY" isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

interface QuickRateCardProps {
  from: string;
  to: string;
  isDark: boolean;
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  MYR: '🇲🇾',
  SGD: '🇸🇬',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  INR: '🇮🇳',
  CNY: '🇨🇳',
};

function QuickRateCard({ from, to, isDark }: QuickRateCardProps) {
  const { data, isLoading } = useExchangeRates();

  // Calculate rate from USD base
  const getRate = (): number | null => {
    if (!data?.rates) return null;
    if (from === 'USD') {
      return data.rates[to] || null;
    }
    const fromRate = data.rates[from];
    const toRate = data.rates[to];
    if (!fromRate || !toRate) return null;
    return toRate / fromRate;
  };

  const rate = getRate();

  return (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xl">{CURRENCY_FLAGS[from]}</span>
        <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <span className="text-xl">{CURRENCY_FLAGS[to]}</span>
      </div>
      <p className={`text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {from} / {to}
      </p>
      {isLoading ? (
        <div className={`h-4 w-16 mx-auto mt-2 rounded animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      ) : rate !== null ? (
        <p className={`text-center text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {rate >= 100 ? rate.toFixed(2) : rate.toFixed(4)}
        </p>
      ) : null}
    </div>
  );
}
