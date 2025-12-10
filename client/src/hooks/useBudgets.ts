import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as budgetService from '../services/budget.service';
import { CreateBudgetRequest, UpdateBudgetRequest } from '../types/budget.types';

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: budgetService.getBudgets,
  });
}

export function useBudgetsWithStatus() {
  return useQuery({
    queryKey: ['budgets', 'status'],
    queryFn: budgetService.getBudgetsWithStatus,
  });
}

export function useBudgetAlerts() {
  return useQuery({
    queryKey: ['budgets', 'alerts'],
    queryFn: budgetService.getBudgetAlerts,
  });
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => budgetService.getBudget(id),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBudgetRequest }) =>
      budgetService.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
