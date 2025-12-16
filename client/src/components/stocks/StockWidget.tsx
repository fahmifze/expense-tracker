import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useMarketOverview } from '../../hooks/useStocks';

export default function StockWidget() {
  const { isDark } = useTheme();
  const { data, isLoading, error } = useMarketOverview();

  if (isLoading) {
    return (
      <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="animate-pulse">
          <div className={`h-5 w-24 rounded mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-10 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Market
          </h3>
        </div>
        <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Unable to load market data
        </p>
      </div>
    );
  }

  const topStocks = data.quotes.slice(0, 5);
  const marketStatus = data.marketStatus;

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Market
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                marketStatus?.isOpen
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  marketStatus?.isOpen ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              {marketStatus?.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {topStocks.map((quote) => {
            const isPositive = quote.change >= 0;
            return (
              <div
                key={quote.symbol}
                className={`flex items-center justify-between py-2 border-b last:border-0 ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {quote.symbol}
                  </span>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ${quote.price.toFixed(2)}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded ${
                    isPositive
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        <Link
          to="/stocks"
          className={`block mt-4 text-center text-sm font-medium text-primary-500 hover:text-primary-600`}
        >
          View All Stocks
        </Link>
      </div>
    </div>
  );
}
