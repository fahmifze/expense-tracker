import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { StockQuote } from '../../types/stock.types';

interface StockCardProps {
  quote: StockQuote;
  onAddToWatchlist?: () => void;
  onRemoveFromWatchlist?: () => void;
  onClick?: () => void;
  compact?: boolean;
  showNavigation?: boolean;
}

export default function StockCard({
  quote,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onClick,
  compact = false,
  showNavigation = true,
}: StockCardProps) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isPositive = quote.change >= 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showNavigation) {
      navigate(`/stocks/${quote.symbol}`);
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          isDark
            ? 'bg-gray-700/50 hover:bg-gray-700 hover:shadow-lg'
            : 'bg-gray-50 hover:bg-white hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {quote.symbol}
            </span>
            <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              ${quote.price.toFixed(2)}
            </span>
          </div>
          <span
            className={`text-sm font-semibold px-2 py-0.5 rounded ${
              isPositive
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-gray-800 border-gray-700 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5'
          : 'bg-white border-gray-200 hover:border-primary-500/50 hover:shadow-lg'
      }`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {quote.symbol}
            </h3>
            {/* Arrow indicator */}
            <svg
              className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className={`text-sm truncate mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {quote.name}
          </p>
        </div>
        {(onAddToWatchlist || onRemoveFromWatchlist) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              quote.isInWatchlist ? onRemoveFromWatchlist?.() : onAddToWatchlist?.();
            }}
            className={`p-2 rounded-lg transition-all ${
              quote.isInWatchlist
                ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                : isDark
                ? 'text-gray-500 hover:text-yellow-500 hover:bg-gray-700'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
            }`}
            title={quote.isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <svg
              className="w-5 h-5"
              fill={quote.isInWatchlist ? 'currentColor' : 'none'}
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
          </button>
        )}
      </div>

      {/* Price */}
      <div className="mb-3">
        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          ${quote.price.toFixed(2)}
        </p>
      </div>

      {/* Change */}
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {isPositive ? '+' : ''}${quote.change.toFixed(2)}
        </span>
        <span
          className={`text-sm font-semibold px-2 py-1 rounded-md ${
            isPositive
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(quote.changePercent).toFixed(2)}%
        </span>
      </div>

      {/* Day Range */}
      <div className={`mt-4 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex justify-between text-xs">
          <div>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>High </span>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              ${quote.high.toFixed(2)}
            </span>
          </div>
          <div>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Low </span>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              ${quote.low.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
