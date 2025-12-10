import api from './api';
import { Insight, FinancialSummary } from '../types/insights.types';
import { ApiResponse } from '../types/api.types';

export async function getInsights(): Promise<Insight[]> {
  const response = await api.get<ApiResponse<Insight[]>>('/insights');
  return response.data.data!;
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const response = await api.get<ApiResponse<FinancialSummary>>('/insights/summary');
  return response.data.data!;
}
