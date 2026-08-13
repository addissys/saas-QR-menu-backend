import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Permission-based authorization middleware
 *
 * Example:
 *
 * authorizePermission('users.read')
 *
 * or:
 *
 * authorizePermission('tenant.create')
 */
export const authorizePermission = (
  requiredPermission: string
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Find the permission assigned to the user's role
      const rolePermission =
        await prisma.rolePermission.findFirst({
          where: {
            role_id: req.user.roleId,
            deleted_at: null,

            permission: {
              permission: requiredPermission,
              deleted_at: null,
            },
          },

          include: {
            permission: true,
            role: true,
          },
        });

      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          message: 'You do not have the required permission',
          required_permission: requiredPermission,
        });
      }

      // Make sure the role itself is not soft deleted
      if (rolePermission.role.deleted_at) {
        return res.status(403).json({
          success: false,
          message: 'Your role is inactive',
        });
      }

      next();
    } catch (error) {
      console.error(
        'Permission middleware error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Permission authorization failed',
      });
    }
  };
};