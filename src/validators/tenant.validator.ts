import { z } from 'zod';

export const createTenantSchema = z.object({
  owner_id: z.string().uuid(),

  business_name: z
    .string()
    .min(2)
    .max(255),

  business_slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Business slug must contain lowercase letters, numbers and hyphens only'
    ),

  logo_url: z.string().url().optional(),

  brand_color: z
    .string()
    .max(30)
    .optional(),

  email: z.string().email(),

  phone: z
    .string()
    .max(20)
    .optional(),

  address: z
    .string()
    .min(2)
    .max(255),

  city: z
    .string()
    .min(2)
    .max(100),

  country: z
    .string()
    .min(2)
    .max(100),
});

export const updateTenantSchema =
  z.object({
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
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      )
      .optional(),

    logo_url: z.string().url().optional(),

    brand_color: z
      .string()
      .max(30)
      .optional(),

    email: z.string().email().optional(),

    phone: z
      .string()
      .max(20)
      .optional(),

    address: z
      .string()
      .min(2)
      .max(255)
      .optional(),

    city: z
      .string()
      .min(2)
      .max(100)
      .optional(),

    country: z
      .string()
      .min(2)
      .max(100)
      .optional(),

    status: z
      .enum([
        'PENDING',
        'TRIAL',
        'ACTIVE',
        'SUSPENDED',
        'INACTIVE',
      ])
      .optional(),

    is_active: z
      .boolean()
      .optional(),
  });