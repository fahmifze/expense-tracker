import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAddToWatchlist } from '../hooks/useStocks';
import { StockSearchResult } from '../types/stock.types';
import MarketOverview from '../components/stocks/MarketOverview';
import WatchlistTable from '../components/stocks/WatchlistTable';
import StockSearch from '../components/stocks/StockSearch';
import AlertsList from '../components/stocks/AlertsList';
import AlertModal from '../components/stocks/AlertModal';
import TransactionModal from '../components/stocks/TransactionModal';

type TabType = 'overview' | 'watchlist' | 'alerts';

export default function Stocks() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);

  const addToWatchlist = useAddToWatchlist();

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock({ symbol: stock.symbol, name: stock.name });
    setShowTransactionModal(true);
  };

  const handleQuickAdd = (stock: StockSearchResult) => {
    addToWatchlist.mutate({ symbol: stock.symbol, name: stock.name });
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Market Overview' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'alerts', label: 'Alerts' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Stock Market
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Track stocks, manage your watchlist, and set price alerts
        </p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <StockSearch
            onSelect={handleStockSelect}
            placeholder="Search stocks to trade..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedStock(null);
              setShowTransactionModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Trade
          </button>
          <button
            onClick={() => {
              setSelectedStock(null);
              setShowAlertModal(true);
            }}
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
      </div>

      {/* Quick Add to Watchlist */}
      <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Quick Add to Watchlist
        </h3>
        <StockSearch
          onSelect={handleQuickAdd}
          placeholder="Search and add to watchlist..."
        />
      </div>

      {/* Tabs */}
      <div className={`mb-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <MarketOverview />}

      {activeTab === 'watchlist' && <WatchlistTable />}

      {activeTab === 'alerts' && (
        <AlertsList
          onCreateAlert={() => {
            setSelectedStock(null);
            setShowAlertModal(true);
          }}
        />
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedStock(null);
        }}
        preselectedStock={selectedStock}
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setSelectedStock(null);
        }}
        preselectedStock={selectedStock}
      />
    </div>
  );
}
