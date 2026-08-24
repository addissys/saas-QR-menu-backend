import { z } from 'zod';

export const createTableSchema = z.object({
  branch_id: z.string().uuid('Invalid branch ID'),

  table_number: z
    .string()
    .trim()
    .min(1, 'Table number is required')
    .max(50),

  is_active: z
    .boolean()
    .optional(),
});

export const updateTableSchema = z.object({
  table_number: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

  is_active: z
    .boolean()
    .optional(),
});