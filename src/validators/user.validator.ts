import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must contain at least 2 characters')
    .max(255),

  email: z
    .string()
    .email('Invalid email address')
    .max(255),

  phone: z
    .string()
    .max(20)
    .optional(),

  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(100),

  role_id: z
    .string()
    .min(1, 'Role ID is required'),
});

export const updateUserSchema = z.object({
  full_name: z
    .string()
    .min(2)
    .max(255)
    .optional(),

  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .optional(),

  phone: z
    .string()
    .max(20)
    .optional(),

  role_id: z
    .string()
    .min(1)
    .optional(),
});

export const updateUserStatusSchema = z.object({
  is_active: z.boolean(),
});