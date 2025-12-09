import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters')
      .optional(),
    lastName: z
      .string()
      .max(100, 'Last name must be less than 100 characters')
      .optional(),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter code')
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'New password must be less than 100 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
