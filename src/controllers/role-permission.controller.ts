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