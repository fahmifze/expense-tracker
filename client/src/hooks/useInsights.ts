import { useQuery } from '@tanstack/react-query';
import * as insightsService from '../services/insights.service';

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: insightsService.getInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes - insights don't need to be super fresh
  });
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['insights', 'summary'],
    queryFn: insightsService.getFinancialSummary,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
