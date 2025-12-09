import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Category name is required')
      .max(100, 'Category name must be less than 100 characters'),
    icon: z
      .string()
      .max(50, 'Icon must be less than 50 characters')
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
      .optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Category name is required')
      .max(100, 'Category name must be less than 100 characters')
      .optional(),
    icon: z
      .string()
      .max(50, 'Icon must be less than 50 characters')
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
