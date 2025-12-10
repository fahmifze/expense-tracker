import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as recurringService from '../services/recurring.service';
import {
  CreateRecurringRequest,
  UpdateRecurringRequest,
  RecurringFilters,
} from '../types/recurring.types';

export function useRecurringRules(filters: RecurringFilters = {}) {
  return useQuery({
    queryKey: ['recurring', filters],
    queryFn: () => recurringService.getRecurringRules(filters),
  });
}

export function useRecurringRule(id: number) {
  return useQuery({
    queryKey: ['recurring', id],
    queryFn: () => recurringService.getRecurringRule(id),
    enabled: !!id,
  });
}

export function useUpcomingRecurring(days: number = 30) {
  return useQuery({
    queryKey: ['recurring', 'upcoming', days],
    queryFn: () => recurringService.getUpcomingRecurring(days),
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringRequest) => recurringService.createRecurringRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecurringRequest }) =>
      recurringService.updateRecurringRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recurringService.deleteRecurringRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}

export function useToggleRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recurringService.toggleRecurringRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}

export function useProcessRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recurringService.processRecurringRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });
}
