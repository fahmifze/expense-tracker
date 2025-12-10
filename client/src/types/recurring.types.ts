export type RecurringType = 'expense' | 'income';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: number;
  userId: number;
  type: RecurringType;
  categoryId: number;
  amount: number;
  description: string | null;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string | null;
  nextOccurrence: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringRuleWithCategory extends RecurringRule {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export interface CreateRecurringRequest {
  type: RecurringType;
  categoryId: number;
  amount: number;
  description?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
}

export interface UpdateRecurringRequest {
  categoryId?: number;
  amount?: number;
  description?: string;
  frequency?: RecurringFrequency;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

export interface RecurringFilters {
  type?: RecurringType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedRecurring {
  data: RecurringRuleWithCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpcomingRecurring extends RecurringRuleWithCategory {
  daysUntil: number;
}

export interface ProcessRecurringResult {
  processed: number;
  errors: number;
}
