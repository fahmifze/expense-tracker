import * as RecurringModel from '../models/recurring.model';
import * as CategoryModel from '../models/category.model';
import * as IncomeCategoryModel from '../models/incomeCategory.model';
import * as ExpenseModel from '../models/expense.model';
import * as IncomeModel from '../models/income.model';
import { CreateRecurringInput, UpdateRecurringInput, ListRecurringQuery } from '../validators/recurring.validator';
import { AppError } from '../middleware/error.middleware';

export async function listRecurringRules(userId: number, query?: ListRecurringQuery) {
  return RecurringModel.findAllByUser(userId, query?.type);
}

export async function getRecurringRule(userId: number, ruleId: number) {
  const rule = await RecurringModel.findById(ruleId);

  if (!rule) {
    throw AppError.notFound('Recurring rule not found');
  }

  if (rule.userId !== userId) {
    throw AppError.forbidden('Not authorized to view this recurring rule');
  }

  return rule;
}

export async function createRecurringRule(userId: number, data: CreateRecurringInput) {
  // Verify category based on type
  if (data.type === 'expense') {
    const category = await CategoryModel.findById(data.categoryId);

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (!category.is_default && category.user_id !== userId) {
      throw AppError.forbidden('Not authorized to use this category');
    }
  } else {
    const canAccess = await IncomeCategoryModel.canUserAccess(data.categoryId, userId);

    if (!canAccess) {
      throw AppError.notFound('Income category not found');
    }
  }

  return RecurringModel.create({
    userId,
    type: data.type,
    categoryId: data.categoryId,
    amount: data.amount,
    description: data.description,
    frequency: data.frequency,
    intervalValue: data.intervalValue,
    dayOfWeek: data.dayOfWeek,
    dayOfMonth: data.dayOfMonth,
    monthOfYear: data.monthOfYear,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null,
  });
}

export async function updateRecurringRule(userId: number, ruleId: number, data: UpdateRecurringInput) {
  const rule = await RecurringModel.findById(ruleId);

  if (!rule) {
    throw AppError.notFound('Recurring rule not found');
  }

  if (rule.userId !== userId) {
    throw AppError.forbidden('Not authorized to update this recurring rule');
  }

  // Verify category if changing
  if (data.categoryId !== undefined) {
    if (rule.type === 'expense') {
      const category = await CategoryModel.findById(data.categoryId);

      if (!category) {
        throw AppError.notFound('Category not found');
      }

      if (!category.is_default && category.user_id !== userId) {
        throw AppError.forbidden('Not authorized to use this category');
      }
    } else {
      const canAccess = await IncomeCategoryModel.canUserAccess(data.categoryId, userId);

      if (!canAccess) {
        throw AppError.notFound('Income category not found');
      }
    }
  }

  return RecurringModel.update(ruleId, {
    categoryId: data.categoryId,
    amount: data.amount,
    description: data.description,
    frequency: data.frequency,
    intervalValue: data.intervalValue,
    dayOfWeek: data.dayOfWeek,
    dayOfMonth: data.dayOfMonth,
    monthOfYear: data.monthOfYear,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    isActive: data.isActive,
  });
}

export async function deleteRecurringRule(userId: number, ruleId: number) {
  const rule = await RecurringModel.findById(ruleId);

  if (!rule) {
    throw AppError.notFound('Recurring rule not found');
  }

  if (rule.userId !== userId) {
    throw AppError.forbidden('Not authorized to delete this recurring rule');
  }

  return RecurringModel.remove(ruleId);
}

export async function toggleRecurringRule(userId: number, ruleId: number) {
  const rule = await RecurringModel.findById(ruleId);

  if (!rule) {
    throw AppError.notFound('Recurring rule not found');
  }

  if (rule.userId !== userId) {
    throw AppError.forbidden('Not authorized to update this recurring rule');
  }

  return RecurringModel.update(ruleId, { isActive: !rule.isActive });
}

// Process due recurring rules - called by cron job or manually
export async function processDueRules(): Promise<{
  processed: number;
  expenses: number;
  incomes: number;
  errors: string[];
}> {
  const dueRules = await RecurringModel.getDueRules();
  let expenseCount = 0;
  let incomeCount = 0;
  const errors: string[] = [];

  for (const rule of dueRules) {
    try {
      if (rule.type === 'expense') {
        // Create expense
        await ExpenseModel.create({
          userId: rule.userId,
          categoryId: rule.categoryId,
          amount: rule.amount,
          description: rule.description ?? undefined,
          expenseDate: new Date(rule.nextOccurrence),
        });
        expenseCount++;
      } else {
        // Create income
        await IncomeModel.create({
          userId: rule.userId,
          categoryId: rule.categoryId,
          amount: rule.amount,
          description: rule.description ?? undefined,
          incomeDate: new Date(rule.nextOccurrence),
          isRecurring: true,
          recurringRuleId: rule.id,
        });
        incomeCount++;
      }

      // Mark as processed and calculate next occurrence
      await RecurringModel.markProcessed(rule.id);
    } catch (error) {
      errors.push(`Failed to process rule ${rule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    processed: dueRules.length,
    expenses: expenseCount,
    incomes: incomeCount,
    errors,
  };
}

// Get upcoming recurring transactions for preview
export async function getUpcomingRecurring(
  userId: number,
  days: number = 30
): Promise<RecurringModel.RecurringRuleWithCategory[]> {
  const rules = await RecurringModel.findAllByUser(userId);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return rules.filter((rule) => {
    if (!rule.isActive) return false;
    const nextOccurrence = new Date(rule.nextOccurrence);
    return nextOccurrence <= futureDate;
  });
}
