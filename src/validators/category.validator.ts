import { z } from 'zod';

export const createCategorySchema = z.object({
  branch_id: z.string().uuid('Invalid branch ID'),

  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(255),

  description: z
    .string()
    .trim()
    .max(200)
    .optional(),

  sort_order: z
    .number()
    .int()
    .min(0)
    .optional(),

  is_active: z
    .boolean()
    .optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .optional(),

  description: z
    .string()
    .trim()
    .max(200)
    .nullable()
    .optional(),

  sort_order: z
    .number()
    .int()
    .min(0)
    .optional(),

  is_active: z
    .boolean()
    .optional(),
});