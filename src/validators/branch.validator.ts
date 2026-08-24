import { z } from 'zod';

export const createBranchSchema = z.object({
  tenant_id: z
    .string()
    .uuid('Invalid tenant ID'),

  branch_name: z
    .string()
    .trim()
    .min(2, 'Branch name must be at least 2 characters')
    .max(255, 'Branch name is too long'),

  branch_code: z
    .string()
    .trim()
    .min(1, 'Branch code is required')
    .max(100, 'Branch code is too long'),

  address: z
    .string()
    .trim()
    .min(2, 'Address is required')
    .max(255, 'Address is too long'),

  city: z
    .string()
    .trim()
    .min(2, 'City is required')
    .max(100, 'City is too long'),

  phone: z
    .string()
    .trim()
    .max(20, 'Phone number is too long')
    .optional(),

  manager_id: z
    .string()
    .uuid('Invalid manager ID')
    .optional(),

  status: z
    .enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
    .optional(),

  is_active: z
    .boolean()
    .optional(),
});

export const updateBranchSchema = z
  .object({
    branch_name: z
      .string()
      .trim()
      .min(2)
      .max(255)
      .optional(),

    branch_code: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    address: z
      .string()
      .trim()
      .min(2)
      .max(255)
      .optional(),

    city: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    phone: z
      .string()
      .trim()
      .max(20)
      .optional(),

    manager_id: z
      .string()
      .uuid()
      .nullable()
      .optional(),

    status: z
      .enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
      .optional(),

    is_active: z
      .boolean()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field is required',
    }
  );

export type CreateBranchInput = z.infer<
  typeof createBranchSchema
>;

export type UpdateBranchInput = z.infer<
  typeof updateBranchSchema
>;