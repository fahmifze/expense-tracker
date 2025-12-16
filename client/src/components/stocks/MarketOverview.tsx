import { useTheme } from '../../context/ThemeContext';
import { useMarketOverview, useAddToWatchlist, useRemoveFromWatchlist } from '../../hooks/useStocks';
import StockCard from './StockCard';

interface MarketOverviewProps {
  onStockClick?: (symbol: string) => void;
}

export default function MarketOverview({ onStockClick }: MarketOverviewProps) {
  const { isDark } = useTheme();
  const { data, isLoading, error } = useMarketOverview();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  if (isLoading) {
    return (
      <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="animate-pulse">
          <div className={`h-6 w-40 rounded mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-32 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="text-center">
          <p className={isDark ? 'text-red-400' : 'text-red-600'}>
            Failed to load market data
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  const quotes = data?.quotes || [];
  const marketStatus = data?.marketStatus;

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Market Overview
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Top US Stocks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              marketStatus?.isOpen
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${
                marketStatus?.isOpen ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            {marketStatus?.isOpen ? 'Market Open' : 'Market Closed'}
          </span>
        </div>
      </div>

      <div className="p-4">
        {quotes.length === 0 ? (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No market data available
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quotes.map((quote) => (
              <StockCard
                key={quote.symbol}
                quote={quote}
                onClick={onStockClick ? () => onStockClick(quote.symbol) : undefined}
                onAddToWatchlist={() => addToWatchlist.mutate({ symbol: quote.symbol, name: quote.name })}
                onRemoveFromWatchlist={() => removeFromWatchlist.mutate(quote.symbol)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
