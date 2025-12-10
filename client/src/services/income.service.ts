import api from './api';
import {
  IncomeWithCategory,
  IncomeCategory,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  IncomeFilters,
  PaginatedIncomes,
  IncomeStats,
  CreateIncomeCategoryRequest,
  UpdateIncomeCategoryRequest,
} from '../types/income.types';
import { ApiResponse } from '../types/api.types';

// Income CRUD
export async function getIncomes(filters: IncomeFilters = {}): Promise<PaginatedIncomes> {
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
  const url = queryString ? `/incomes?${queryString}` : '/incomes';

  const response = await api.get<ApiResponse<PaginatedIncomes>>(url);
  return response.data.data!;
}

export async function getIncome(id: number): Promise<IncomeWithCategory> {
  const response = await api.get<ApiResponse<IncomeWithCategory>>(`/incomes/${id}`);
  return response.data.data!;
}

export async function createIncome(data: CreateIncomeRequest): Promise<IncomeWithCategory> {
  const response = await api.post<ApiResponse<IncomeWithCategory>>('/incomes', data);
  return response.data.data!;
}

export async function updateIncome(
  id: number,
  data: UpdateIncomeRequest
): Promise<IncomeWithCategory> {
  const response = await api.patch<ApiResponse<IncomeWithCategory>>(`/incomes/${id}`, data);
  return response.data.data!;
}

export async function deleteIncome(id: number): Promise<void> {
  await api.delete(`/incomes/${id}`);
}

export async function getIncomeStats(): Promise<IncomeStats> {
  const response = await api.get<ApiResponse<IncomeStats>>('/incomes/stats');
  return response.data.data!;
}

// Income Category CRUD
export async function getIncomeCategories(): Promise<IncomeCategory[]> {
  const response = await api.get<ApiResponse<IncomeCategory[]>>('/incomes/categories');
  return response.data.data!;
}

export async function getIncomeCategory(id: number): Promise<IncomeCategory> {
  const response = await api.get<ApiResponse<IncomeCategory>>(`/incomes/categories/${id}`);
  return response.data.data!;
}

export async function createIncomeCategory(
  data: CreateIncomeCategoryRequest
): Promise<IncomeCategory> {
  const response = await api.post<ApiResponse<IncomeCategory>>('/incomes/categories', data);
  return response.data.data!;
}

export async function updateIncomeCategory(
  id: number,
  data: UpdateIncomeCategoryRequest
): Promise<IncomeCategory> {
  const response = await api.patch<ApiResponse<IncomeCategory>>(`/incomes/categories/${id}`, data);
  return response.data.data!;
}

export async function deleteIncomeCategory(id: number): Promise<void> {
  await api.delete(`/incomes/categories/${id}`);
}
