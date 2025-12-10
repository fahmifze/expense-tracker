import api from './api';
import {
  Budget,
  BudgetWithStatus,
  BudgetAlert,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../types/budget.types';
import { ApiResponse } from '../types/api.types';

export async function getBudgets(): Promise<Budget[]> {
  const response = await api.get<ApiResponse<Budget[]>>('/budgets');
  return response.data.data!;
}

export async function getBudgetsWithStatus(): Promise<BudgetWithStatus[]> {
  const response = await api.get<ApiResponse<BudgetWithStatus[]>>('/budgets/status');
  return response.data.data!;
}

export async function getBudgetAlerts(): Promise<BudgetAlert[]> {
  const response = await api.get<ApiResponse<BudgetAlert[]>>('/budgets/alerts');
  return response.data.data!;
}

export async function getBudget(id: number): Promise<BudgetWithStatus> {
  const response = await api.get<ApiResponse<BudgetWithStatus>>(`/budgets/${id}`);
  return response.data.data!;
}

export async function createBudget(data: CreateBudgetRequest): Promise<Budget> {
  const response = await api.post<ApiResponse<Budget>>('/budgets', data);
  return response.data.data!;
}

export async function updateBudget(id: number, data: UpdateBudgetRequest): Promise<Budget> {
  const response = await api.patch<ApiResponse<Budget>>(`/budgets/${id}`, data);
  return response.data.data!;
}

export async function deleteBudget(id: number): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
