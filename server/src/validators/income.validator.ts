import { z } from 'zod';

export const createIncomeSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer').nullable().optional(),
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
    incomeDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  }),
});

export const updateIncomeSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer').nullable().optional(),
    amount: z.number().positive('Amount must be greater than 0').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
    incomeDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const getIncomeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const listIncomesSchema = z.object({
  query: z.object({
    categoryId: z.string().regex(/^\d+$/).optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date')
      .optional(),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date')
      .optional(),
    minAmount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    maxAmount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    search: z.string().max(100).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    sortBy: z.enum(['incomeDate', 'amount', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Income Category validators
export const createIncomeCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    icon: z.string().max(50).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
      .optional(),
  }),
});

export const updateIncomeCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100, 'Name cannot exceed 100 characters').optional(),
    icon: z.string().max(50).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const getIncomeCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>['body'];
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>['body'];
export type ListIncomesQuery = z.infer<typeof listIncomesSchema>['query'];
export type CreateIncomeCategoryInput = z.infer<typeof createIncomeCategorySchema>['body'];
export type UpdateIncomeCategoryInput = z.infer<typeof updateIncomeCategorySchema>['body'];
