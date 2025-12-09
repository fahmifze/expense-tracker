import * as ExpenseModel from '../models/expense.model';
import * as CategoryModel from '../models/category.model';
import { CreateExpenseInput, UpdateExpenseInput, ListExpensesQuery } from '../validators/expense.validator';
import { AppError } from '../middleware/error.middleware';

export async function listExpenses(userId: number, query: ListExpensesQuery) {
  const filters: ExpenseModel.ExpenseFilters = {
    userId,
    categoryId: query.categoryId ? parseInt(query.categoryId) : undefined,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
    minAmount: query.minAmount ? parseFloat(query.minAmount) : undefined,
    maxAmount: query.maxAmount ? parseFloat(query.maxAmount) : undefined,
    search: query.search,
    page: query.page ? parseInt(query.page) : 1,
    limit: query.limit ? Math.min(parseInt(query.limit), 100) : 10, // Max 100 per page
    sortBy: query.sortBy || 'expenseDate',
    sortOrder: query.sortOrder || 'desc',
  };

  return ExpenseModel.findAllByUser(filters);
}

export async function getExpense(userId: number, expenseId: number) {
  const expense = await ExpenseModel.findById(expenseId);

  if (!expense) {
    throw AppError.notFound('Expense not found');
  }

  if (expense.userId !== userId) {
    throw AppError.forbidden('Not authorized to view this expense');
  }

  return expense;
}

export async function createExpense(userId: number, data: CreateExpenseInput) {
  // Verify category exists and user has access
  const category = await CategoryModel.findById(data.categoryId);

  if (!category) {
    throw AppError.notFound('Category not found');
  }

  // User can use default categories or their own custom categories
  if (!category.is_default && category.user_id !== userId) {
    throw AppError.forbidden('Not authorized to use this category');
  }

  return ExpenseModel.create({
    userId,
    categoryId: data.categoryId,
    amount: data.amount,
    description: data.description,
    expenseDate: new Date(data.expenseDate),
  });
}

export async function updateExpense(
  userId: number,
  expenseId: number,
  data: UpdateExpenseInput
) {
  const expense = await ExpenseModel.findById(expenseId);

  if (!expense) {
    throw AppError.notFound('Expense not found');
  }

  if (expense.userId !== userId) {
    throw AppError.forbidden('Not authorized to update this expense');
  }

  // If updating category, verify access
  if (data.categoryId) {
    const category = await CategoryModel.findById(data.categoryId);

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (!category.is_default && category.user_id !== userId) {
      throw AppError.forbidden('Not authorized to use this category');
    }
  }

  return ExpenseModel.update(expenseId, {
    categoryId: data.categoryId,
    amount: data.amount,
    description: data.description,
    expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
  });
}

export async function deleteExpense(userId: number, expenseId: number) {
  const expense = await ExpenseModel.findById(expenseId);

  if (!expense) {
    throw AppError.notFound('Expense not found');
  }

  if (expense.userId !== userId) {
    throw AppError.forbidden('Not authorized to delete this expense');
  }

  return ExpenseModel.remove(expenseId);
}

export async function getExpenseStats(userId: number) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get current month total
  const monthlyTotal = await ExpenseModel.getMonthlyTotal(userId, currentYear, currentMonth);

  // Get last month total for comparison
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const lastMonthTotal = await ExpenseModel.getMonthlyTotal(userId, lastMonthYear, lastMonth);

  // Get recent expenses
  const recentExpenses = await ExpenseModel.getRecentExpenses(userId, 5);

  // Get category breakdown for current month
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0);
  const categoryTotals = await ExpenseModel.getCategoryTotals(userId, startOfMonth, endOfMonth);

  // Get monthly trend (last 6 months)
  const monthlyTrend = await ExpenseModel.getMonthlyTrend(userId, 6);

  // Get category breakdown for pie chart (current month)
  const categoryBreakdown = await ExpenseModel.getCategoryBreakdown(userId, startOfMonth, endOfMonth);

  // Get daily totals for current month
  const dailyTotals = await ExpenseModel.getDailyTotals(userId, currentYear, currentMonth);

  return {
    monthlyTotal,
    lastMonthTotal,
    recentExpenses,
    categoryTotals,
    monthlyTrend,
    categoryBreakdown,
    dailyTotals,
    currentMonth: {
      month: currentMonth,
      year: currentYear,
    },
  };
}
