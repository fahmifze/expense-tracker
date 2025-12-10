import api from './api';
import {
  RecurringRuleWithCategory,
  CreateRecurringRequest,
  UpdateRecurringRequest,
  RecurringFilters,
  PaginatedRecurring,
  UpcomingRecurring,
  ProcessRecurringResult,
} from '../types/recurring.types';
import { ApiResponse } from '../types/api.types';

export async function getRecurringRules(
  filters: RecurringFilters = {}
): Promise<PaginatedRecurring> {
  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/recurring?${queryString}` : '/recurring';

  const response = await api.get<ApiResponse<PaginatedRecurring>>(url);
  return response.data.data!;
}

export async function getRecurringRule(id: number): Promise<RecurringRuleWithCategory> {
  const response = await api.get<ApiResponse<RecurringRuleWithCategory>>(`/recurring/${id}`);
  return response.data.data!;
}

export async function createRecurringRule(
  data: CreateRecurringRequest
): Promise<RecurringRuleWithCategory> {
  const response = await api.post<ApiResponse<RecurringRuleWithCategory>>('/recurring', data);
  return response.data.data!;
}

export async function updateRecurringRule(
  id: number,
  data: UpdateRecurringRequest
): Promise<RecurringRuleWithCategory> {
  const response = await api.patch<ApiResponse<RecurringRuleWithCategory>>(
    `/recurring/${id}`,
    data
  );
  return response.data.data!;
}

export async function deleteRecurringRule(id: number): Promise<void> {
  await api.delete(`/recurring/${id}`);
}

export async function toggleRecurringRule(id: number): Promise<RecurringRuleWithCategory> {
  const response = await api.patch<ApiResponse<RecurringRuleWithCategory>>(
    `/recurring/${id}/toggle`
  );
  return response.data.data!;
}

export async function getUpcomingRecurring(days: number = 30): Promise<UpcomingRecurring[]> {
  const response = await api.get<ApiResponse<UpcomingRecurring[]>>(
    `/recurring/upcoming?days=${days}`
  );
  return response.data.data!;
}

export async function processRecurringRules(): Promise<ProcessRecurringResult> {
  const response = await api.post<ApiResponse<ProcessRecurringResult>>('/recurring/process');
  return response.data.data!;
}
