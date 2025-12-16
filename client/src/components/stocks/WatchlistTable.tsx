import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useWatchlist, useRemoveFromWatchlist } from '../../hooks/useStocks';

interface WatchlistTableProps {
  onStockClick?: (symbol: string) => void;
}

export default function WatchlistTable({ onStockClick }: WatchlistTableProps) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { data, isLoading, error } = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  if (isLoading) {
    return (
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4 border-b">
          <div className={`h-6 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-12 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={`text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          Failed to load watchlist
        </p>
      </div>
    );
  }

  const watchlist = data?.watchlist || [];

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-4 border-b">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Watchlist
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'}
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="p-8 text-center">
          <svg
            className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            No stocks in watchlist
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Search and add stocks to track them here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Symbol
                </th>
                <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Price
                </th>
                <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Change
                </th>
                <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  % Change
                </th>
                <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {watchlist.map((item) => {
                const quote = item.quote;
                const isPositive = quote && quote.change >= 0;

                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      if (onStockClick) {
                        onStockClick(item.symbol);
                      } else {
                        navigate(`/stocks/${item.symbol}`);
                      }
                    }}
                    className={`cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.symbol}
                        </span>
                        <p className={`text-sm truncate max-w-[150px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.name}
                        </p>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {quote ? `$${quote.price.toFixed(2)}` : '-'}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      quote ? (isPositive ? 'text-green-500' : 'text-red-500') : (isDark ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                      {quote ? `${isPositive ? '+' : ''}$${quote.change.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {quote ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-sm font-medium ${
                            isPositive
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist.mutate(item.symbol);
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          isDark
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                        }`}
                        title="Remove from watchlist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
