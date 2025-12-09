import api from './api';
import {
  ExpenseWithCategory,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  PaginatedExpenses,
  ExpenseStats,
} from '../types/expense.types';
import { ApiResponse } from '../types/api.types';

export async function getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedExpenses> {
  const params = new URLSearchParams();

  if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString());
  if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  const url = queryString ? `/expenses?${queryString}` : '/expenses';

  const response = await api.get<ApiResponse<PaginatedExpenses>>(url);
  return response.data.data!;
}

export async function getExpense(id: number): Promise<ExpenseWithCategory> {
  const response = await api.get<ApiResponse<ExpenseWithCategory>>(`/expenses/${id}`);
  return response.data.data!;
}

export async function createExpense(data: CreateExpenseRequest): Promise<ExpenseWithCategory> {
  const response = await api.post<ApiResponse<ExpenseWithCategory>>('/expenses', data);
  return response.data.data!;
}

export async function updateExpense(
  id: number,
  data: UpdateExpenseRequest
): Promise<ExpenseWithCategory> {
  const response = await api.patch<ApiResponse<ExpenseWithCategory>>(`/expenses/${id}`, data);
  return response.data.data!;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

export async function getExpenseStats(): Promise<ExpenseStats> {
  const response = await api.get<ApiResponse<ExpenseStats>>('/expenses/stats');
  return response.data.data!;
}
