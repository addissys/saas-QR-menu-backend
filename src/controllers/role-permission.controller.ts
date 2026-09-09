import {
  Request,
  Response,
} from 'express';

import {
  assignPermissionsSchema,
  roleIdSchema,
  rolePermissionParamsSchema,
} from '../validators/role-permission.validator';

import {
  getRolePermissions,
  assignPermissionsToRole,
  revokePermissionFromRole,
} from '../services/role-permission.service';

import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createAuditLog } from '../services/audit-log.service';
import prisma from '../config/prisma';

export const listPermissions = async (_req: AuthenticatedRequest, res: Response) => {
  const permissions = await prisma.permission.findMany({
    where: { deleted_at: null },
    select: { id: true, permission: true, module: true, action: true, description: true },
    orderBy: [{ module: 'asc' }, { permission: 'asc' }],
  });
  return res.status(200).json({ success: true, data: permissions });
};

/**
 * GET /permissions/grantable
 * Returns only permissions the current authenticated user is allowed to grant.
 * - SUPER_ADMIN: all permissions
 * - Everyone else: only permissions in their own effective set (role perms ∪ user perms)
 *
 * The frontend MUST use this endpoint to populate the Additional Permissions selector.
 * The backend ALSO enforces this in assignUserPermissionsController.
 */
export const listGrantablePermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorRole = req.user?.roleName?.toUpperCase();

    // SUPER_ADMIN can grant anything — return full catalog
    if (actorRole === 'SUPER_ADMIN') {
      const permissions = await prisma.permission.findMany({
        where: { deleted_at: null },
        select: { id: true, permission: true, module: true, action: true, description: true },
        orderBy: [{ module: 'asc' }, { permission: 'asc' }],
      });
      return res.status(200).json({ success: true, data: permissions });
    }

    // For everyone else: compute their effective permissions (role ∪ user)
    const userId = req.user?.id;
    const roleId = req.user?.roleId;
    if (!userId || !roleId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Get effective permission codes
    const [rolePerms, userPerms] = await Promise.all([
      prisma.rolePermission.findMany({
        where: { role_id: roleId, deleted_at: null, permission: { deleted_at: null } },
        select: { permission: { select: { id: true, permission: true, module: true, action: true, description: true } } },
      }),
      prisma.userPermission.findMany({
        where: { user_id: userId, deleted_at: null, permission: { deleted_at: null } },
        select: { permission: { select: { id: true, permission: true, module: true, action: true, description: true } } },
      }),
    ]);

    // Union by permission ID
    const seen = new Map<string, { id: string; permission: string; module: string; action: string; description: string | null }>();
    for (const rp of rolePerms) seen.set(rp.permission.id, rp.permission);
    for (const up of userPerms) seen.set(up.permission.id, up.permission);

    const grantable = Array.from(seen.values()).sort((a, b) =>
      a.module.localeCompare(b.module) || a.permission.localeCompare(b.permission)
    );

    return res.status(200).json({ success: true, data: grantable });
  } catch (error: any) {
    console.error('List grantable permissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve grantable permissions' });
  }
};

/**
 * GET /roles/:roleId/permissions
 */
export const getPermissionsByRole =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const validation =
        roleIdSchema.safeParse(req.params);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID',
          errors:
            validation.error.issues,
        });
      }

      const result =
        await getRolePermissions(
          validation.data.roleId
        );

      return res.status(200).json({
        success: true,
        message:
          'Role permissions retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      console.error(
        'Get role permissions error:',
        error
      );

      if (
        error.message ===
        'Role not found'
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          'Failed to retrieve role permissions',
      });
    }
  };

/**
 * POST /roles/:roleId/permissions/assign
 */
export const assignPermissions =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const paramsValidation =
        roleIdSchema.safeParse(req.params);

      if (!paramsValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID',
          errors:
            paramsValidation.error.issues,
        });
      }

      const bodyValidation =
        assignPermissionsSchema.safeParse(
          req.body
        );

      if (!bodyValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors:
            bodyValidation.error.issues,
        });
      }

      const result =
        await assignPermissionsToRole(
          paramsValidation.data.roleId,
          bodyValidation.data
            .permission_ids
        );

      const authReq = req as AuthenticatedRequest;
      await createAuditLog({
        user_id: authReq.user?.id,
        tenant_id: authReq.user?.tenantId,
        module: 'role_permissions',
        action: 'ASSIGN_ROLE_PERMISSIONS',
        entity_name: 'RolePermission',
        entity_id: paramsValidation.data.roleId,
        new_values: { permission_ids: bodyValidation.data.permission_ids },
        user_role: authReq.user?.roleName,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        success: true,
      });

      return res.status(200).json({
        success: true,
        message:
          'Permissions assigned to role successfully',
        data: result,
      });
    } catch (error: any) {
      console.error(
        'Assign permissions error:',
        error
      );

      if (
        error.message ===
          'Role not found' ||
        error.message ===
          'One or more permissions were not found'
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          'Failed to assign permissions',
      });
    }
  };

/**
 * DELETE /roles/:roleId/permissions/:permissionId
 */
export const revokePermission =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const validation =
        rolePermissionParamsSchema.safeParse(
          req.params
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid role ID or permission ID',
          errors:
            validation.error.issues,
        });
      }

      const result =
        await revokePermissionFromRole(
          validation.data.roleId,
          validation.data.permissionId
        );

      const authReq = req as AuthenticatedRequest;
      await createAuditLog({
        user_id: authReq.user?.id,
        tenant_id: authReq.user?.tenantId,
        module: 'role_permissions',
        action: 'REVOKE_ROLE_PERMISSION',
        entity_name: 'RolePermission',
        entity_id: validation.data.roleId,
        old_values: { permission_id: validation.data.permissionId },
        user_role: authReq.user?.roleName,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        success: true,
      });

      return res.status(200).json({
        success: true,
        message:
          'Permission revoked from role successfully',
        data: result,
      });
    } catch (error: any) {
      console.error(
        'Revoke permission error:',
        error
      );

      if (
        error.message ===
          'Role not found' ||
        error.message ===
          'Permission not found' ||
        error.message ===
          'Permission is not assigned to this role'
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          'Failed to revoke permission',
      });
    }
  };