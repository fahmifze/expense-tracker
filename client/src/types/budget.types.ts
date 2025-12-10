export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: number;
  userId: number;
  categoryId: number | null;
  amount: number;
  period: BudgetPeriod;
  alertAt80: boolean;
  alertAt100: boolean;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithCategory extends Budget {
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface BudgetWithStatus extends BudgetWithCategory {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isWarning: boolean;
}

export interface BudgetAlert {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  amount: number;
  spent: number;
  percentage: number;
  isOverBudget: boolean;
  isWarning: boolean;
}

export interface CreateBudgetRequest {
  categoryId?: number | null;
  amount: number;
  period?: BudgetPeriod;
  alertAt80?: boolean;
  alertAt100?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBudgetRequest {
  categoryId?: number | null;
  amount?: number;
  period?: BudgetPeriod;
  alertAt80?: boolean;
  alertAt100?: boolean;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
