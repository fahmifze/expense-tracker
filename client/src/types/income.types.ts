export interface Income {
  id: number;
  userId: number;
  categoryId: number | null;
  amount: number;
  description: string | null;
  incomeDate: string;
  isRecurring: boolean;
  recurringRuleId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeWithCategory extends Income {
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface IncomeCategory {
  id: number;
  userId: number | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateIncomeRequest {
  categoryId?: number;
  amount: number;
  description?: string;
  incomeDate: string;
  isRecurring?: boolean;
}

export interface UpdateIncomeRequest {
  categoryId?: number;
  amount?: number;
  description?: string;
  incomeDate?: string;
  isRecurring?: boolean;
}

export interface IncomeFilters {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'incomeDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedIncomes {
  data: IncomeWithCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IncomeCategoryBreakdown {
  categoryId: number;
  categoryName: string;
  total: number;
  color: string;
}

export interface IncomeMonthlyTrend {
  month: string;
  year: number;
  total: number;
}

export interface IncomeStats {
  monthlyTotal: number;
  yearlyTotal: number;
  categoryBreakdown: IncomeCategoryBreakdown[];
  monthlyTrend: IncomeMonthlyTrend[];
}

export interface CreateIncomeCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateIncomeCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}
