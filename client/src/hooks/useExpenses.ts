import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as expenseService from '../services/expense.service';
import { CreateExpenseRequest, UpdateExpenseRequest, ExpenseFilters } from '../types/expense.types';

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expenseService.getExpenses(filters),
  });
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expenseService.getExpense(id),
    enabled: !!id,
  });
}

export function useExpenseStats() {
  return useQuery({
    queryKey: ['expenses', 'stats'],
    queryFn: expenseService.getExpenseStats,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseRequest }) =>
      expenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
