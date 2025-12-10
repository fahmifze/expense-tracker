import * as BudgetModel from '../models/budget.model';
import * as CategoryModel from '../models/category.model';
import { CreateBudgetInput, UpdateBudgetInput } from '../validators/budget.validator';
import { AppError } from '../middleware/error.middleware';

export async function listBudgets(userId: number) {
  return BudgetModel.findAllByUser(userId);
}

export async function getBudgetsWithStatus(userId: number) {
  return BudgetModel.getBudgetsWithStatus(userId);
}

export async function getBudgetAlerts(userId: number) {
  return BudgetModel.getBudgetAlerts(userId);
}

export async function getBudget(userId: number, budgetId: number) {
  const budget = await BudgetModel.findById(budgetId);

  if (!budget) {
    throw AppError.notFound('Budget not found');
  }

  if (budget.userId !== userId) {
    throw AppError.forbidden('Not authorized to view this budget');
  }

  // Get spent amount
  const spent = await BudgetModel.getSpentAmount(userId, budget.categoryId, budget.period);
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - spent;

  return {
    ...budget,
    spent,
    percentage,
    remaining,
    isOverBudget: percentage >= 100,
    isWarning: percentage >= 80 && percentage < 100,
  };
}

export async function createBudget(userId: number, data: CreateBudgetInput) {
  // If categoryId provided, verify it exists and user has access
  if (data.categoryId) {
    const category = await CategoryModel.findById(data.categoryId);

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (!category.is_default && category.user_id !== userId) {
      throw AppError.forbidden('Not authorized to use this category');
    }
  }

  // Check if budget already exists for this category and period
  const existing = await BudgetModel.findByUserAndCategory(
    userId,
    data.categoryId ?? null,
    data.period ?? 'monthly'
  );

  if (existing) {
    throw AppError.conflict(
      data.categoryId
        ? 'A budget already exists for this category and period'
        : 'An overall budget already exists for this period'
    );
  }

  return BudgetModel.create({
    userId,
    categoryId: data.categoryId ?? null,
    amount: data.amount,
    period: data.period,
    alertAt80: data.alertAt80,
    alertAt100: data.alertAt100,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  });
}

export async function updateBudget(userId: number, budgetId: number, data: UpdateBudgetInput) {
  const budget = await BudgetModel.findById(budgetId);

  if (!budget) {
    throw AppError.notFound('Budget not found');
  }

  if (budget.userId !== userId) {
    throw AppError.forbidden('Not authorized to update this budget');
  }

  // If changing category, verify access
  if (data.categoryId !== undefined && data.categoryId !== null) {
    const category = await CategoryModel.findById(data.categoryId);

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (!category.is_default && category.user_id !== userId) {
      throw AppError.forbidden('Not authorized to use this category');
    }

    // Check if another budget exists for new category/period combo
    const period = data.period ?? budget.period;
    const existing = await BudgetModel.findByUserAndCategory(userId, data.categoryId, period);

    if (existing && existing.id !== budgetId) {
      throw AppError.conflict('A budget already exists for this category and period');
    }
  }

  return BudgetModel.update(budgetId, {
    categoryId: data.categoryId,
    amount: data.amount,
    period: data.period,
    alertAt80: data.alertAt80,
    alertAt100: data.alertAt100,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    isActive: data.isActive,
  });
}

export async function deleteBudget(userId: number, budgetId: number) {
  const budget = await BudgetModel.findById(budgetId);

  if (!budget) {
    throw AppError.notFound('Budget not found');
  }

  if (budget.userId !== userId) {
    throw AppError.forbidden('Not authorized to delete this budget');
  }

  return BudgetModel.remove(budgetId);
}
