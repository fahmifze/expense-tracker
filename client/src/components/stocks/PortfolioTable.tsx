import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../hooks/useStocks';

interface PortfolioTableProps {
  onHoldingClick?: (holdingId: number) => void;
}

export default function PortfolioTable({ onHoldingClick }: PortfolioTableProps) {
  const { isDark } = useTheme();
  const { data, isLoading, error } = usePortfolio();

  if (isLoading) {
    return (
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4 border-b">
          <div className={`h-6 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
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
          Failed to load portfolio
        </p>
      </div>
    );
  }

  const holdings = data?.holdings || [];
  const summary = data?.summary;

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Summary Header */}
      {summary && (
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Value</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Cost</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Gain/Loss</p>
              <p className={`text-xl font-bold ${summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summary.totalGainLoss >= 0 ? '+' : ''}${summary.totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Return</p>
              <p className={`text-xl font-bold ${summary.totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summary.totalGainLossPercent >= 0 ? '+' : ''}{summary.totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="p-4">
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Holdings ({holdings.length})
        </h3>

        {holdings.length === 0 ? (
          <div className="text-center py-8">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              No holdings yet
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Add your first stock transaction to start tracking
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Stock
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Shares
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Avg Cost
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Current
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Value
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {holdings.map((holding) => {
                  const isPositive = (holding.gainLoss || 0) >= 0;

                  return (
                    <tr
                      key={holding.id}
                      onClick={() => onHoldingClick?.(holding.id)}
                      className={`cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {holding.symbol}
                          </span>
                          <p className={`text-sm truncate max-w-[150px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {holding.name}
                          </p>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${holding.averageCost.toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${(holding.currentPrice || 0).toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${(holding.currentValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}${(holding.gainLoss || 0).toFixed(2)}
                          </span>
                          <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{(holding.gainLossPercent || 0).toFixed(2)}%
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
