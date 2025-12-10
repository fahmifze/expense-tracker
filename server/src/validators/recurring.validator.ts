import { z } from 'zod';

export const createRecurringSchema = z.object({
  body: z.object({
    type: z.enum(['expense', 'income']),
    categoryId: z.number().int().positive('Category ID must be a positive integer'),
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    intervalValue: z.number().int().positive().max(365).optional().default(1),
    dayOfWeek: z.number().int().min(0).max(6).nullable().optional(), // 0=Sunday, 6=Saturday
    dayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
    monthOfYear: z.number().int().min(1).max(12).nullable().optional(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .nullable()
      .optional(),
  }),
});

export const updateRecurringSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer').optional(),
    amount: z.number().positive('Amount must be greater than 0').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    intervalValue: z.number().int().positive().max(365).optional(),
    dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
    dayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
    monthOfYear: z.number().int().min(1).max(12).nullable().optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .optional(),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const getRecurringSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const listRecurringSchema = z.object({
  query: z.object({
    type: z.enum(['expense', 'income']).optional(),
  }),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>['body'];
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>['body'];
export type ListRecurringQuery = z.infer<typeof listRecurringSchema>['query'];
