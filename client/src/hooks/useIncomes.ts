import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as incomeService from '../services/income.service';
import {
  CreateIncomeRequest,
  UpdateIncomeRequest,
  IncomeFilters,
  CreateIncomeCategoryRequest,
  UpdateIncomeCategoryRequest,
} from '../types/income.types';

// Income hooks
export function useIncomes(filters: IncomeFilters = {}) {
  return useQuery({
    queryKey: ['incomes', filters],
    queryFn: () => incomeService.getIncomes(filters),
  });
}

export function useIncome(id: number) {
  return useQuery({
    queryKey: ['incomes', id],
    queryFn: () => incomeService.getIncome(id),
    enabled: !!id,
  });
}

export function useIncomeStats() {
  return useQuery({
    queryKey: ['incomes', 'stats'],
    queryFn: incomeService.getIncomeStats,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeRequest) => incomeService.createIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIncomeRequest }) =>
      incomeService.updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => incomeService.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

// Income Category hooks
export function useIncomeCategories() {
  return useQuery({
    queryKey: ['incomeCategories'],
    queryFn: incomeService.getIncomeCategories,
  });
}

export function useIncomeCategory(id: number) {
  return useQuery({
    queryKey: ['incomeCategories', id],
    queryFn: () => incomeService.getIncomeCategory(id),
    enabled: !!id,
  });
}

export function useCreateIncomeCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeCategoryRequest) => incomeService.createIncomeCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeCategories'] });
    },
  });
}

export function useUpdateIncomeCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIncomeCategoryRequest }) =>
      incomeService.updateIncomeCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeCategories'] });
    },
  });
}

export function useDeleteIncomeCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => incomeService.deleteIncomeCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeCategories'] });
    },
  });
}
