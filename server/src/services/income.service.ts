import * as IncomeModel from '../models/income.model';
import * as IncomeCategoryModel from '../models/incomeCategory.model';
import {
  CreateIncomeInput,
  UpdateIncomeInput,
  ListIncomesQuery,
  CreateIncomeCategoryInput,
  UpdateIncomeCategoryInput,
} from '../validators/income.validator';
import { AppError } from '../middleware/error.middleware';

// Income CRUD
export async function listIncomes(userId: number, query: ListIncomesQuery) {
  const filters: IncomeModel.IncomeFilters = {
    userId,
    categoryId: query.categoryId ? parseInt(query.categoryId) : undefined,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
    minAmount: query.minAmount ? parseFloat(query.minAmount) : undefined,
    maxAmount: query.maxAmount ? parseFloat(query.maxAmount) : undefined,
    search: query.search,
    page: query.page ? parseInt(query.page) : 1,
    limit: query.limit ? Math.min(parseInt(query.limit), 100) : 10,
    sortBy: query.sortBy || 'incomeDate',
    sortOrder: query.sortOrder || 'desc',
  };

  return IncomeModel.findAllByUser(filters);
}

export async function getIncome(userId: number, incomeId: number) {
  const income = await IncomeModel.findById(incomeId);

  if (!income) {
    throw AppError.notFound('Income not found');
  }

  if (income.userId !== userId) {
    throw AppError.forbidden('Not authorized to view this income');
  }

  return income;
}

export async function createIncome(userId: number, data: CreateIncomeInput) {
  // Verify category if provided
  if (data.categoryId) {
    const canAccess = await IncomeCategoryModel.canUserAccess(data.categoryId, userId);

    if (!canAccess) {
      throw AppError.notFound('Income category not found');
    }
  }

  return IncomeModel.create({
    userId,
    categoryId: data.categoryId ?? null,
    amount: data.amount,
    description: data.description,
    notes: data.notes,
    incomeDate: new Date(data.incomeDate),
  });
}

export async function updateIncome(userId: number, incomeId: number, data: UpdateIncomeInput) {
  const income = await IncomeModel.findById(incomeId);

  if (!income) {
    throw AppError.notFound('Income not found');
  }

  if (income.userId !== userId) {
    throw AppError.forbidden('Not authorized to update this income');
  }

  // Verify category if updating
  if (data.categoryId !== undefined && data.categoryId !== null) {
    const canAccess = await IncomeCategoryModel.canUserAccess(data.categoryId, userId);

    if (!canAccess) {
      throw AppError.notFound('Income category not found');
    }
  }

  return IncomeModel.update(incomeId, {
    categoryId: data.categoryId,
    amount: data.amount,
    description: data.description,
    notes: data.notes,
    incomeDate: data.incomeDate ? new Date(data.incomeDate) : undefined,
  });
}

export async function deleteIncome(userId: number, incomeId: number) {
  const income = await IncomeModel.findById(incomeId);

  if (!income) {
    throw AppError.notFound('Income not found');
  }

  if (income.userId !== userId) {
    throw AppError.forbidden('Not authorized to delete this income');
  }

  return IncomeModel.remove(incomeId);
}

// Income Stats
export async function getIncomeStats(userId: number) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get current month total
  const monthlyTotal = await IncomeModel.getMonthlyTotal(userId, currentYear, currentMonth);

  // Get last month total for comparison
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const lastMonthTotal = await IncomeModel.getMonthlyTotal(userId, lastMonthYear, lastMonth);

  // Get yearly total
  const yearlyTotal = await IncomeModel.getYearlyTotal(userId, currentYear);

  // Get recent incomes
  const recentIncomes = await IncomeModel.getRecentIncomes(userId, 5);

  // Get monthly trend (last 6 months)
  const monthlyTrend = await IncomeModel.getMonthlyTrend(userId, 6);

  // Get category breakdown for current month
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0);
  const categoryBreakdown = await IncomeModel.getCategoryBreakdown(userId, startOfMonth, endOfMonth);

  return {
    monthlyTotal,
    lastMonthTotal,
    yearlyTotal,
    recentIncomes,
    monthlyTrend,
    categoryBreakdown,
    currentMonth: {
      month: currentMonth,
      year: currentYear,
    },
  };
}

// Income Category CRUD
export async function listIncomeCategories(userId: number) {
  return IncomeCategoryModel.findAllForUser(userId);
}

export async function getIncomeCategory(userId: number, categoryId: number) {
  const category = await IncomeCategoryModel.findById(categoryId);

  if (!category) {
    throw AppError.notFound('Income category not found');
  }

  const canAccess = await IncomeCategoryModel.canUserAccess(categoryId, userId);

  if (!canAccess) {
    throw AppError.forbidden('Not authorized to view this category');
  }

  return IncomeCategoryModel.toIncomeCategoryPublic(category);
}

export async function createIncomeCategory(userId: number, data: CreateIncomeCategoryInput) {
  // Check if name already exists
  const exists = await IncomeCategoryModel.nameExistsForUser(data.name, userId);

  if (exists) {
    throw AppError.conflict('An income category with this name already exists');
  }

  return IncomeCategoryModel.create({
    userId,
    name: data.name,
    icon: data.icon,
    color: data.color,
  });
}

export async function updateIncomeCategory(
  userId: number,
  categoryId: number,
  data: UpdateIncomeCategoryInput
) {
  const category = await IncomeCategoryModel.findById(categoryId);

  if (!category) {
    throw AppError.notFound('Income category not found');
  }

  // Can't modify default categories
  if (category.isDefault) {
    throw AppError.forbidden('Cannot modify default categories');
  }

  // Must own the category
  if (category.userId !== userId) {
    throw AppError.forbidden('Not authorized to update this category');
  }

  // Check name uniqueness if updating name
  if (data.name) {
    const exists = await IncomeCategoryModel.nameExistsForUser(data.name, userId, categoryId);

    if (exists) {
      throw AppError.conflict('An income category with this name already exists');
    }
  }

  return IncomeCategoryModel.update(categoryId, data);
}

export async function deleteIncomeCategory(userId: number, categoryId: number) {
  const category = await IncomeCategoryModel.findById(categoryId);

  if (!category) {
    throw AppError.notFound('Income category not found');
  }

  if (category.isDefault) {
    throw AppError.forbidden('Cannot delete default categories');
  }

  if (category.userId !== userId) {
    throw AppError.forbidden('Not authorized to delete this category');
  }

  return IncomeCategoryModel.deleteCategory(categoryId);
}
