import { z } from 'zod';

export const registerSchema = z.object({
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
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),

  password: z
    .string()
    .min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2)
    .max(255)
    .optional(),

  phone: z
    .string()
    .max(20)
    .optional(),

  profile_image: z
    .string()
    .max(500)
    .optional(),
});

export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(1),

  new_password: z
    .string()
    .min(8)
    .max(100),
});

export const refreshTokenSchema = z.object({
  refresh_token: z
    .string()
    .min(1),
});