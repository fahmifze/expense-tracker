import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../hooks/useStocks';
import PortfolioTable from '../components/stocks/PortfolioTable';
import TransactionModal from '../components/stocks/TransactionModal';

type TabType = 'holdings' | 'transactions';

export default function Portfolio() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('holdings');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionPage, setTransactionPage] = useState(1);

  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(transactionPage);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'holdings', label: 'Holdings' },
    { id: 'transactions', label: 'Transactions' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Portfolio
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Track your stock investments and performance
          </p>
        </div>
        <button
          onClick={() => setShowTransactionModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </button>
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
      {activeTab === 'holdings' && (
        <PortfolioTable
          onHoldingClick={(holdingId) => {
            console.log('Clicked holding:', holdingId);
          }}
        />
      )}

      {activeTab === 'transactions' && (
        <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 border-b">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Transaction History
            </h2>
          </div>

          {transactionsLoading ? (
            <div className="p-4">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                ))}
              </div>
            </div>
          ) : transactionsData?.transactions.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                No transactions yet
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Add your first buy or sell transaction
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Date
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Type
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Shares
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Price
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {transactionsData?.transactions.map((tx) => (
                      <tr key={tx.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                              tx.type === 'buy'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </td>
                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          ${tx.price.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${(tx.quantity * tx.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {transactionsData && transactionsData.pagination.totalPages > 1 && (
                <div className={`p-4 border-t flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Page {transactionsData.pagination.page} of {transactionsData.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTransactionPage((p) => Math.max(1, p - 1))}
                      disabled={transactionPage === 1}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setTransactionPage((p) => Math.min(transactionsData.pagination.totalPages, p + 1))}
                      disabled={transactionPage === transactionsData.pagination.totalPages}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </div>
  );
}
