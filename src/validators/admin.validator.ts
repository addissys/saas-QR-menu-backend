import { z } from 'zod';

export const adminSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Search query is required')
    .max(100, 'Search query is too long'),

  type: z
    .enum(['all', 'tenants', 'users', 'branches', 'menu-items'])
    .default('all'),

  page: z
    .string()
    .optional()
    .default('1')
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value >= 1, {
      message: 'Page must be a positive integer',
    }),

  limit: z
    .string()
    .optional()
    .default('10')
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value >= 1 && value <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});

export type AdminSearchQuery = z.infer<typeof adminSearchSchema>;