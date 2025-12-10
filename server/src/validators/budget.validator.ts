import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer').nullable().optional(),
    amount: z.number().positive('Amount must be greater than 0'),
    period: z.enum(['weekly', 'monthly', 'yearly']).optional().default('monthly'),
    alertAt80: z.boolean().optional().default(true),
    alertAt100: z.boolean().optional().default(true),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .nullable()
      .optional(),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .nullable()
      .optional(),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer').nullable().optional(),
    amount: z.number().positive('Amount must be greater than 0').optional(),
    period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
    alertAt80: z.boolean().optional(),
    alertAt100: z.boolean().optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .nullable()
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

export const getBudgetSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>['body'];
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>['body'];
