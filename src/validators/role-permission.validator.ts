import { z } from 'zod';

export const assignPermissionsSchema = z.object({
  permission_ids: z
    .array(z.string().uuid())
    .min(1, 'At least one permission ID is required'),
});

export const roleIdSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
});

export const rolePermissionParamsSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
  permissionId: z.string().uuid('Invalid permission ID'),
});