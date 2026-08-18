import { z } from 'zod';

export const assignExecutiveBranchSchema = z.object({
  branch_id: z
    .string()
    .uuid('Invalid branch ID'),
});

export const assignExecutiveBranchesSchema = z.object({
  branch_ids: z
    .array(
      z.string().uuid('Invalid branch ID')
    )
    .min(1, 'At least one branch is required'),
});