import {
  Response,
  NextFunction,
} from 'express';

import prisma from '../config/prisma';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Role-Based Authorization Middleware
 *
 * Usage:
 *
 * requireRoles('SUPER_ADMIN')
 *
 * Multiple roles:
 *
 * requireRoles(
 *   'SUPER_ADMIN',
 *   'CAFE_OWNER'
 * )
 *
 * The user must:
 * 1. Be authenticated
 * 2. Have a valid role
 * 3. Have a non-deleted role
 * 4. Have one of the required roles
 */
export interface RequireRolesOptions {
  message?: string;
}

export const requireRoles = (
  ...args: (string | RequireRolesOptions)[]
) => {
  let options: RequireRolesOptions | undefined;
  const allowedRoles: string[] = [];

  for (const arg of args) {
    if (typeof arg === 'string') {
      allowedRoles.push(arg);
    } else if (typeof arg === 'object' && arg !== null) {
      options = arg;
    }
  }

  const unauthorizedMessage =
    options?.message || 'You do not have permission to perform this action';

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1. Check Authentication

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            'Authentication required',
        });
      }

      
      // 2. Make Sure Allowed Roles Were Provided

      if (allowedRoles.length === 0) {
        console.error(
          'Role middleware error: No allowed roles provided'
        );

        return res.status(500).json({
          success: false,
          message:
            'Role authorization is not configured correctly',
        });
      }

      // 3. Get Current Role From Database

      const role =
        await prisma.role.findFirst({
          where: {
            id: req.user.roleId,

            // Soft-delete protection
            deleted_at: null,
          },
        });

      
      // 4. Check Role Exists

      if (!role) {
        return res.status(403).json({
          success: false,
          message:
            'User role not found or inactive',
        });
      }

      
      // 5. Check Role Name

      const hasRequiredRole =
        allowedRoles.some(
          (allowedRole) =>
            allowedRole.toLowerCase() ===
            role.name.toLowerCase()
        );

      
      // 6. Reject Unauthorized Role

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: unauthorizedMessage,
        });
      }

    
      // 7. Continue

      next();
    } catch (error) {
      console.error(
        'Role authorization error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to verify user role',
      });
    }
  };
};