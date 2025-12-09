import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer'),
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    expenseDate: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Invalid date format'
    ),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer').optional(),
    amount: z.number().positive('Amount must be greater than 0').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    expenseDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const getExpenseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const listExpensesSchema = z.object({
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
    sortBy: z.enum(['expenseDate', 'amount', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>['body'];
export type ListExpensesQuery = z.infer<typeof listExpensesSchema>['query'];
