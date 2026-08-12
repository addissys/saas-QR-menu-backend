import {
  Response,
  NextFunction,
} from 'express';

import { AuthenticatedRequest } from './auth.middleware';

export const requireRoles = (
  ...allowedRoles: string[]
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

      const prisma =
        (await import('../config/prisma')).default;

      const role =
        await prisma.role.findFirst({
          where: {
            id: req.user.roleId,
            deleted_at: null,
          },
        });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'User role not found',
        });
      }

      if (
        !allowedRoles.includes(role.name)
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
        });
      }

      next();
    } catch (error) {
      console.error(
        'Role authorization error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Failed to verify user role',
      });
    }
  };
};