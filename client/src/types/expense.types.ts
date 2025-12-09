export interface Expense {
  id: number;
  userId: number;
  categoryId: number;
  amount: number;
  description: string | null;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseWithCategory extends Expense {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export interface CreateExpenseRequest {
  categoryId: number;
  amount: number;
  description?: string;
  expenseDate: string;
}

export interface UpdateExpenseRequest {
  categoryId?: number;
  amount?: number;
  description?: string;
  expenseDate?: string;
}

export interface ExpenseFilters {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'expenseDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedExpenses {
  data: ExpenseWithCategory[];
  pagination: PaginationInfo;
}

export interface MonthlyTrendData {
  month: string;
  year: number;
  total: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface DailyTotal {
  day: number;
  total: number;
}

export interface ExpenseStats {
  monthlyTotal: number;
  lastMonthTotal: number;
  recentExpenses: ExpenseWithCategory[];
  categoryTotals: {
    categoryId: number;
    categoryName: string;
    total: number;
  }[];
  monthlyTrend: MonthlyTrendData[];
  categoryBreakdown: CategoryBreakdown[];
  dailyTotals: DailyTotal[];
  currentMonth: {
    month: number;
    year: number;
  };
}
