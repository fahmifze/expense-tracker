import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useStockSearch } from '../../hooks/useStocks';
import { StockSearchResult } from '../../types/stock.types';

interface StockSearchProps {
  onSelect: (stock: StockSearchResult) => void;
  placeholder?: string;
}

export default function StockSearch({ onSelect, placeholder = 'Search stocks...' }: StockSearchProps) {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useStockSearch(query);
  const results = data?.results || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: StockSearchResult) => {
    onSelect(stock);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
          } focus:outline-none focus:ring-1 focus:ring-primary-500`}
        />
        <svg
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.length >= 1 && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-64 overflow-auto ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {results.length === 0 && !isLoading ? (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No stocks found
            </div>
          ) : (
            results.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stock.symbol}
                  </span>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stock.name}
                  </p>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {stock.type}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
