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


export const createTenantSchema = z.object({
  owner_id: z.string().uuid(),

  business_name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(255),

  business_slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Business slug can only contain lowercase letters, numbers, and hyphens'
    ),

  logo_url: z.string().url().optional(),

  brand_color: z.string().max(30).optional(),

  email: z.string().email(),

  phone: z.string().max(20).optional(),

  address: z.string().max(255),

  city: z.string().max(100),

  country: z.string().max(100),
});

export const updateTenantSchema = z.object({
  business_name: z
    .string()
    .min(2)
    .max(255)
    .optional(),

  business_slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Business slug can only contain lowercase letters, numbers, and hyphens'
    )
    .optional(),

  logo_url: z.string().url().optional(),

  brand_color: z.string().max(30).optional(),

  email: z.string().email().optional(),

  phone: z.string().max(20).optional(),

  address: z.string().max(255).optional(),

  city: z.string().max(100).optional(),

  country: z.string().max(100).optional(),
});