import pool from '../models/db';
import { RowDataPacket } from 'mysql2';
import * as ExpenseModel from '../models/expense.model';
import * as IncomeModel from '../models/income.model';
import * as BudgetModel from '../models/budget.model';

export interface Insight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  icon: string;
  category?: string;
  value?: number;
  change?: number;
}

// Get all insights for a user
export async function getInsights(userId: number): Promise<Insight[]> {
  const insights: Insight[] = [];

  // Run all insight generators
  const results = await Promise.all([
    getSpendingChangeInsight(userId),
    getTopCategoryInsight(userId),
    getSavingsInsight(userId),
    getBudgetInsights(userId),
    getUnusualSpendingInsight(userId),
    getWeekendSpendingInsight(userId),
  ]);

  // Flatten and filter out null insights
  for (const result of results) {
    if (Array.isArray(result)) {
      insights.push(...result);
    } else if (result) {
      insights.push(result);
    }
  }

  return insights;
}

// Compare spending month over month
async function getSpendingChangeInsight(userId: number): Promise<Insight | null> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentTotal = await ExpenseModel.getMonthlyTotal(userId, currentYear, currentMonth);
  const lastTotal = await ExpenseModel.getMonthlyTotal(userId, lastMonthYear, lastMonth);

  if (lastTotal === 0) return null;

  const change = ((currentTotal - lastTotal) / lastTotal) * 100;

  if (Math.abs(change) < 5) return null; // Ignore small changes

  if (change > 0) {
    return {
      id: 'spending-increase',
      type: change > 20 ? 'warning' : 'info',
      title: 'Spending Increased',
      message: `Your spending increased by ${Math.abs(change).toFixed(0)}% compared to last month.`,
      icon: 'trending-up',
      change,
    };
  } else {
    return {
      id: 'spending-decrease',
      type: 'success',
      title: 'Spending Decreased',
      message: `Great job! Your spending decreased by ${Math.abs(change).toFixed(0)}% compared to last month.`,
      icon: 'trending-down',
      change,
    };
  }
}

// Find top spending category
async function getTopCategoryInsight(userId: number): Promise<Insight | null> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const breakdown = await ExpenseModel.getCategoryBreakdown(userId, startOfMonth, endOfMonth);

  if (breakdown.length === 0) return null;

  const top = breakdown[0];
  const total = breakdown.reduce((sum, cat) => sum + Number(cat.value), 0);
  const percentage = total > 0 ? (Number(top.value) / total) * 100 : 0;

  if (percentage < 20) return null; // Only show if category is significant

  return {
    id: 'top-category',
    type: 'info',
    title: 'Top Spending Category',
    message: `${top.name} accounts for ${percentage.toFixed(0)}% of your spending this month.`,
    icon: 'pie-chart',
    category: top.name,
    value: Number(top.value),
  };
}

// Compare savings (income - expenses)
async function getSavingsInsight(userId: number): Promise<Insight | null> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Current month
  const currentExpenses = await ExpenseModel.getMonthlyTotal(userId, currentYear, currentMonth);
  const currentIncome = await IncomeModel.getMonthlyTotal(userId, currentYear, currentMonth);
  const currentSavings = currentIncome - currentExpenses;

  // Last month
  const lastExpenses = await ExpenseModel.getMonthlyTotal(userId, lastMonthYear, lastMonth);
  const lastIncome = await IncomeModel.getMonthlyTotal(userId, lastMonthYear, lastMonth);
  const lastSavings = lastIncome - lastExpenses;

  if (lastIncome === 0 && currentIncome === 0) return null;

  if (currentSavings > lastSavings && currentSavings > 0) {
    return {
      id: 'savings-improved',
      type: 'success',
      title: 'Savings Improved',
      message: `You saved more this month compared to last month!`,
      icon: 'piggy-bank',
      value: currentSavings,
    };
  } else if (currentSavings < 0) {
    return {
      id: 'negative-savings',
      type: 'alert',
      title: 'Spending Exceeds Income',
      message: `Your expenses exceed your income this month. Consider reviewing your budget.`,
      icon: 'alert-triangle',
      value: currentSavings,
    };
  }

  return null;
}

// Get budget-related insights
async function getBudgetInsights(userId: number): Promise<Insight[]> {
  const alerts = await BudgetModel.getBudgetAlerts(userId);
  const insights: Insight[] = [];

  for (const budget of alerts) {
    const categoryName = budget.categoryName || 'Overall';

    if (budget.isOverBudget) {
      insights.push({
        id: `budget-exceeded-${budget.id}`,
        type: 'alert',
        title: 'Budget Exceeded',
        message: `Your ${categoryName} budget has been exceeded (${budget.percentage.toFixed(0)}% used).`,
        icon: 'alert-circle',
        category: categoryName,
        value: budget.spent,
        change: budget.percentage,
      });
    } else if (budget.isWarning) {
      insights.push({
        id: `budget-warning-${budget.id}`,
        type: 'warning',
        title: 'Budget Warning',
        message: `You've used ${budget.percentage.toFixed(0)}% of your ${categoryName} budget.`,
        icon: 'alert-triangle',
        category: categoryName,
        value: budget.spent,
        change: budget.percentage,
      });
    }
  }

  return insights;
}

// Find unusual spending (transactions > 2 standard deviations from mean)
async function getUnusualSpendingInsight(userId: number): Promise<Insight | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT AVG(amount) as avg_amount, STDDEV(amount) as std_amount
     FROM expenses
     WHERE user_id = ? AND expense_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`,
    [userId]
  );

  if (rows.length === 0 || !rows[0].avg_amount) return null;

  const avg = Number(rows[0].avg_amount);
  const std = Number(rows[0].std_amount) || avg * 0.5;
  const threshold = avg + 2 * std;

  // Find recent unusual transactions
  const [unusual] = await pool.execute<RowDataPacket[]>(
    `SELECT e.amount, e.description, c.name as categoryName
     FROM expenses e
     LEFT JOIN categories c ON e.category_id = c.id
     WHERE e.user_id = ?
       AND e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       AND e.amount > ?
     ORDER BY e.amount DESC
     LIMIT 1`,
    [userId, threshold]
  );

  if (unusual.length === 0) return null;

  const expense = unusual[0];

  return {
    id: 'unusual-spending',
    type: 'info',
    title: 'Unusual Transaction',
    message: `A recent ${expense.categoryName || 'expense'} of $${Number(expense.amount).toFixed(2)} is higher than your typical spending.`,
    icon: 'alert-circle',
    value: Number(expense.amount),
  };
}

// Analyze weekend spending patterns
async function getWeekendSpendingInsight(userId: number): Promise<Insight | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       SUM(CASE WHEN DAYOFWEEK(expense_date) IN (1, 7) THEN amount ELSE 0 END) as weekend_total,
       SUM(CASE WHEN DAYOFWEEK(expense_date) NOT IN (1, 7) THEN amount ELSE 0 END) as weekday_total,
       COUNT(CASE WHEN DAYOFWEEK(expense_date) IN (1, 7) THEN 1 END) as weekend_count,
       COUNT(CASE WHEN DAYOFWEEK(expense_date) NOT IN (1, 7) THEN 1 END) as weekday_count
     FROM expenses
     WHERE user_id = ?
       AND expense_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`,
    [userId]
  );

  if (rows.length === 0) return null;

  const weekendTotal = Number(rows[0].weekend_total) || 0;
  const weekdayTotal = Number(rows[0].weekday_total) || 0;
  const weekendCount = Number(rows[0].weekend_count) || 0;
  const weekdayCount = Number(rows[0].weekday_count) || 0;

  if (weekendCount === 0 || weekdayCount === 0) return null;

  // Calculate average per day type
  const weekendAvg = weekendTotal / 8; // ~8 weekend days per month
  const weekdayAvg = weekdayTotal / 22; // ~22 weekdays per month

  if (weekendAvg > weekdayAvg * 1.5) {
    return {
      id: 'weekend-spending',
      type: 'info',
      title: 'Weekend Spending Pattern',
      message: `You tend to spend more on weekends. Your weekend average is ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% higher than weekdays.`,
      icon: 'calendar',
      value: weekendTotal,
    };
  }

  return null;
}

// Get financial summary for dashboard
export async function getFinancialSummary(userId: number) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [expenses, income, budgetsWithStatus] = await Promise.all([
    ExpenseModel.getMonthlyTotal(userId, currentYear, currentMonth),
    IncomeModel.getMonthlyTotal(userId, currentYear, currentMonth),
    BudgetModel.getBudgetsWithStatus(userId),
  ]);

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  // Overall budget status
  const overallBudget = budgetsWithStatus.find((b) => b.categoryId === null);

  return {
    income,
    expenses,
    savings,
    savingsRate,
    overallBudget: overallBudget
      ? {
          amount: overallBudget.amount,
          spent: overallBudget.spent,
          percentage: overallBudget.percentage,
          remaining: overallBudget.remaining,
        }
      : null,
    budgetAlerts: budgetsWithStatus.filter((b) => b.isWarning || b.isOverBudget).length,
  };
}
