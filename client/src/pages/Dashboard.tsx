import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { useExpenseStats } from '../hooks/useExpenses';
import { useBudgetAlerts } from '../hooks/useBudgets';
import { useIncomeStats } from '../hooks/useIncomes';
import { useInsights } from '../hooks/useInsights';
import { useUpcomingRecurring } from '../hooks/useRecurring';
import { Link } from 'react-router-dom';
import { MonthlyTrendChart, CategoryPieChart, DailyBarChart } from '../components/charts';
import { LoadingSection } from '../components/ui';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import InsightsList from '../components/insights/InsightsList';
import BudgetProgressBar from '../components/budget/BudgetProgressBar';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const { data: stats, isLoading: statsLoading } = useExpenseStats();
  const { data: budgetAlerts } = useBudgetAlerts();
  const { data: incomeStats } = useIncomeStats();
  const { data: insights, isLoading: insightsLoading } = useInsights();
  const { data: upcomingRecurring } = useUpcomingRecurring(7);

  const totalCategories = categories?.length || 0;
  const customCategories = categories?.filter((c) => !c.isDefault).length || 0;
  const currency = user?.currency || 'MYR';

  // Calculate month-over-month change
  const monthlyExpenses = Number(stats?.monthlyTotal || 0);
  const lastMonthExpenses = Number(stats?.lastMonthTotal || 0);
  const monthChange = lastMonthExpenses > 0
    ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    : 0;

  // Calculate net savings
  const monthlyIncome = Number(incomeStats?.monthlyTotal || 0);
  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Expenses (This Month)</h3>
          <p className="text-2xl font-bold mt-1">
            {statsLoading ? '...' : formatCurrency(monthlyExpenses, currency)}
          </p>
          {!statsLoading && lastMonthExpenses > 0 && (
            <p className={`text-xs mt-1 ${monthChange >= 0 ? 'text-red-200' : 'text-green-200'}`}>
              {monthChange >= 0 ? '+' : ''}{monthChange.toFixed(0)}% vs last month
            </p>
          )}
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Income (This Month)</h3>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(monthlyIncome, currency)}
          </p>
          <Link to="/income" className="text-xs opacity-75 mt-1 hover:underline">
            View details
          </Link>
        </div>

        <div className={`card bg-gradient-to-r ${netSavings >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <h3 className="text-sm font-medium opacity-90">Net Savings</h3>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(netSavings, currency)}
          </p>
          <p className="text-xs opacity-75 mt-1">
            {savingsRate >= 0 ? savingsRate.toFixed(0) : 0}% savings rate
          </p>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Welcome back</h3>
          <p className="text-xl font-bold mt-1">{user?.firstName}</p>
          <p className="text-xs opacity-75 mt-1">{totalCategories} categories ({customCategories} custom)</p>
        </div>
      </div>

      {/* Budget Alerts & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Budget Alerts */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget Status</h3>
            <Link to="/budget" className="text-sm text-primary-600 hover:underline">
              Manage budgets
            </Link>
          </div>
          {budgetAlerts && budgetAlerts.length > 0 ? (
            <div className="space-y-4">
              {budgetAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">
                      {alert.categoryName || 'Overall Budget'}
                    </span>
                    {alert.isOverBudget && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                        Exceeded
                      </span>
                    )}
                    {alert.isWarning && !alert.isOverBudget && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        Warning
                      </span>
                    )}
                  </div>
                  <BudgetProgressBar
                    spent={alert.spent}
                    budget={alert.amount}
                    percentage={alert.percentage}
                    isWarning={alert.isWarning}
                    isOverBudget={alert.isOverBudget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No budget alerts</p>
              <Link to="/budget" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                Set up your first budget
              </Link>
            </div>
          )}
        </div>

        {/* Smart Insights */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
          </div>
          <InsightsList
            insights={insights || []}
            isLoading={insightsLoading}
            maxItems={3}
          />
        </div>
      </div>

      {/* Upcoming Recurring */}
      {upcomingRecurring && upcomingRecurring.length > 0 && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming (Next 7 Days)</h3>
            <Link to="/recurring" className="text-sm text-primary-600 hover:underline">
              Manage recurring
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingRecurring.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${
                  item.type === 'expense' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: item.categoryColor }}
                  >
                    {item.categoryIcon || (item.type === 'expense' ? '-' : '+')}
                  </div>
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {item.categoryName}
                  </span>
                </div>
                <p className={`text-lg font-bold ${
                  item.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount, currency)}
                </p>
                <p className="text-xs text-gray-500">
                  {item.daysUntil === 0 ? 'Today' : item.daysUntil === 1 ? 'Tomorrow' : `In ${item.daysUntil} days`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
