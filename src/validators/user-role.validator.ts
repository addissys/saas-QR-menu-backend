import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must contain at least 2 characters')
    .max(50, 'Role name cannot exceed 50 characters'),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must contain at least 2 characters')
    .max(50, 'Role name cannot exceed 50 characters')
    .optional(),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});