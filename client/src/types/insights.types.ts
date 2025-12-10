export type InsightType = 'info' | 'warning' | 'success' | 'alert';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  icon: string;
  category?: string;
  value?: number;
  change?: number;
}

export interface FinancialSummary {
  currentMonth: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
  lastMonth: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
  changes: {
    income: number;
    expenses: number;
    savings: number;
  };
  budgetStatus: {
    total: number;
    onTrack: number;
    warning: number;
    exceeded: number;
  };
  upcomingRecurring: {
    expenses: number;
    income: number;
    net: number;
  };
}

export interface SpendingForecast {
  predictedTotal: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export interface CategoryForecast {
  categoryId: number;
  categoryName: string;
  predictedAmount: number;
  currentAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}
