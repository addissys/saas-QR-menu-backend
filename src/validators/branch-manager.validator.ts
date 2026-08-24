import { z } from 'zod';

export const createBranchManagerSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
});

export const updateBranchManagerSchema = z.object({
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

export const assignBranchManagerSchema = z.object({
  branch_id: z.string().uuid('Invalid branch ID'),
});