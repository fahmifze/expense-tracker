import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  useStockQuote,
  useCompanyProfile,
  useStockCandles,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from '../hooks/useStocks';
import StockChart from '../components/stocks/StockChart';
import TransactionModal from '../components/stocks/TransactionModal';
import AlertModal from '../components/stocks/AlertModal';

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';

const timeRanges: { value: TimeRange; label: string; days: number }[] = [
  { value: '1W', label: '1W', days: 7 },
  { value: '1M', label: '1M', days: 30 },
  { value: '3M', label: '3M', days: 90 },
  { value: '6M', label: '6M', days: 180 },
  { value: '1Y', label: '1Y', days: 365 },
];

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const selectedRange = timeRanges.find((r) => r.value === timeRange)!;
  const fromTimestamp = Math.floor((Date.now() - selectedRange.days * 24 * 60 * 60 * 1000) / 1000);
  const toTimestamp = Math.floor(Date.now() / 1000);

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);
  const { data: profile, isLoading: profileLoading } = useCompanyProfile(symbol);
  const { data: candlesData, isLoading: candlesLoading } = useStockCandles(
    symbol,
    'D',
    fromTimestamp,
    toTimestamp
  );

  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const candles = candlesData?.candles || [];
  const isPositive = quote && quote.change >= 0;

  const handleWatchlistToggle = () => {
    if (!quote) return;
    if (quote.isInWatchlist) {
      removeFromWatchlist.mutate(quote.symbol);
    } else {
      addToWatchlist.mutate({ symbol: quote.symbol, name: quote.name });
    }
  };

  if (quoteLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className={`h-8 w-48 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-64 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-96 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-xl">Stock not found</p>
          <button
            onClick={() => navigate('/stocks')}
            className="mt-4 text-primary-500 hover:text-primary-600"
          >
            Back to Stocks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 mb-4 text-sm font-medium transition-colors ${
          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
        <div className="flex items-start gap-4">
          {profile?.logo && (
            <img
              src={profile.logo}
              alt={quote.name}
              className="w-16 h-16 rounded-lg object-contain bg-white p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {quote.symbol}
              </h1>
              <button
                onClick={handleWatchlistToggle}
                className={`p-2 rounded-lg transition-colors ${
                  quote.isInWatchlist
                    ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                    : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={quote.isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <svg
                  className="w-6 h-6"
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
            </div>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {quote.name}
            </p>
            {profile && (
              <div className={`flex items-center gap-2 mt-1 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <span>{profile.exchange}</span>
                <span>•</span>
                <span>{profile.industry}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price Display */}
        <div className="text-right">
          <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${quote.price.toFixed(2)}
          </p>
          <div className="flex items-center justify-end gap-2 mt-1">
            <span className={`text-lg font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}${quote.change.toFixed(2)}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-sm font-medium ${
                isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}
            >
              {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Last updated: {new Date(quote.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowTransactionModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buy
        </button>
        <button
          onClick={() => {
            setShowTransactionModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Sell
        </button>
        <button
          onClick={() => setShowAlertModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Set Alert
        </button>
      </div>

      {/* Chart Section */}
      <div className={`rounded-lg border p-6 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Price History
          </h2>
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-primary-500 text-white'
                    : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <StockChart candles={candles} isLoading={candlesLoading} height={350} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Open</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${quote.open.toFixed(2)}
          </p>
        </div>
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Previous Close</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${quote.previousClose.toFixed(2)}
          </p>
        </div>
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Day High</p>
          <p className={`text-xl font-bold text-green-500`}>
            ${quote.high.toFixed(2)}
          </p>
        </div>
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Day Low</p>
          <p className={`text-xl font-bold text-red-500`}>
            ${quote.low.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Company Info */}
      {profile && !profileLoading && (
        <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            About {profile.name}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${(profile.marketCap * 1000000).toLocaleString(undefined, {
                  notation: 'compact',
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Industry</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {profile.industry}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Exchange</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {profile.exchange}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Country</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {profile.country}
              </p>
            </div>
          </div>

          {profile.weburl && (
            <a
              href={profile.weburl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 text-primary-500 hover:text-primary-600 text-sm"
            >
              Visit website
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        preselectedStock={{ symbol: quote.symbol, name: quote.name }}
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        preselectedStock={{ symbol: quote.symbol, name: quote.name }}
      />
    </div>
  );
}
