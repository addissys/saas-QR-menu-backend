import { z } from 'zod';

export const createMenuItemSchema = z.object({
  branch_id: z.string().uuid('Invalid branch ID'),

  category_id: z.string().uuid('Invalid category ID'),

  name: z
    .string()
    .trim()
    .min(1, 'Menu item name is required')
    .max(255),

  description: z
    .string()
    .trim()
    .optional(),

  price: z
    .number()
    .positive('Price must be greater than 0'),

  image_url: z
    .string()
    .url('Invalid image URL')
    .optional()
    .nullable(),

  preparation_time: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .nullable(),

  is_available: z
    .boolean()
    .optional(),

  is_featured: z
    .boolean()
    .optional(),
});

export const updateMenuItemSchema = z.object({
  category_id: z
    .string()
    .uuid('Invalid category ID')
    .optional(),

  name: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .optional(),

  description: z
    .string()
    .trim()
    .nullable()
    .optional(),

  price: z
    .number()
    .positive()
    .optional(),

  image_url: z
    .string()
    .url('Invalid image URL')
    .nullable()
    .optional(),

  preparation_time: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),

  is_available: z
    .boolean()
    .optional(),

  is_featured: z
    .boolean()
    .optional(),
});