import { z } from 'zod';

export const createExecutiveSchema = z.object({
  user_id: z.string().uuid(),
  branch_ids: z.array(z.string().uuid()).optional(),
});

export const updateExecutiveSchema = z.object({
  is_active: z.boolean().optional(),
  employment_status: z
    .enum([
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED',
      'TERMINATED',
    ])
    .optional(),
});

export const assignExecutiveBranchesSchema = z.object({
  branch_ids: z
    .array(z.string().uuid())
    .min(1, 'At least one branch is required'),
});