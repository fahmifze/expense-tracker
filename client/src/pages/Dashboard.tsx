import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { useExpenseStats } from '../hooks/useExpenses';
import { Link } from 'react-router-dom';
import { MonthlyTrendChart, CategoryPieChart, DailyBarChart } from '../components/charts';
import { LoadingSection } from '../components/ui';
import { formatCurrency, formatDateShort } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const { data: stats, isLoading: statsLoading } = useExpenseStats();

  const totalCategories = categories?.length || 0;
  const customCategories = categories?.filter((c) => !c.isDefault).length || 0;
  const currency = user?.currency || 'USD';

  // Calculate month-over-month change
  const monthlyTotal = Number(stats?.monthlyTotal || 0);
  const lastMonthTotal = Number(stats?.lastMonthTotal || 0);
  const monthChange = lastMonthTotal > 0
    ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <h3 className="text-sm font-medium opacity-90">This Month</h3>
          <p className="text-2xl font-bold mt-1">
            {statsLoading ? '...' : formatCurrency(monthlyTotal, currency)}
          </p>
          {!statsLoading && lastMonthTotal > 0 && (
            <p className={`text-xs mt-1 ${monthChange >= 0 ? 'text-red-200' : 'text-green-200'}`}>
              {monthChange >= 0 ? '+' : ''}{monthChange.toFixed(0)}% vs last month
            </p>
          )}
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Last Month</h3>
          <p className="text-2xl font-bold mt-1">
            {statsLoading ? '...' : formatCurrency(lastMonthTotal, currency)}
          </p>
          <p className="text-xs opacity-75 mt-1">Previous period</p>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Categories</h3>
          <p className="text-2xl font-bold mt-1">{totalCategories}</p>
          <p className="text-xs opacity-75 mt-1">{customCategories} custom</p>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Welcome</h3>
          <p className="text-xl font-bold mt-1">{user?.firstName}</p>
          <p className="text-xs opacity-75 mt-1">{currency}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
          {statsLoading ? (
            <LoadingSection />
          ) : (
            <MonthlyTrendChart data={stats?.monthlyTrend || []} currency={currency} />
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          {statsLoading ? (
            <LoadingSection />
          ) : (
            <CategoryPieChart data={stats?.categoryBreakdown || []} currency={currency} />
          )}
        </div>
      </div>

      {/* Daily Chart */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Spending (
          {stats?.currentMonth
            ? new Date(stats.currentMonth.year, stats.currentMonth.month - 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : 'This Month'}
          )
        </h3>
        {statsLoading ? (
          <LoadingSection />
        ) : (
          <DailyBarChart data={stats?.dailyTotals || []} currency={currency} />
        )}
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
          <Link to="/expenses" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        {statsLoading ? (
          <LoadingSection />
        ) : stats?.recentExpenses && stats.recentExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-600 text-sm">Date</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-600 text-sm">Category</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-600 text-sm">Description</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600 text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-sm text-gray-600">
                      {formatDateShort(expense.expenseDate)}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: expense.categoryColor }}
                        >
                          {expense.categoryIcon?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-900">{expense.categoryName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-sm text-gray-600">{expense.description || '-'}</td>
                    <td className="py-2 px-2 text-right font-medium text-gray-900">
                      {formatCurrency(Number(expense.amount), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses yet</p>
            <Link to="/expenses" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
              Add your first expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
