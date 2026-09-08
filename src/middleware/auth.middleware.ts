import {
  Request,
  Response,
  NextFunction,
} from 'express';

import prisma from '../config/prisma';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Authenticated user information
 * attached to req.user after successful authentication.
 */
export interface AuthenticatedUser {
  id: string;
  roleId: string;
  roleName: string;
  tenantId?: string;
  assignedBranchIds?: string[];
}

/**
 * Extended Express request
 */
export interface AuthenticatedRequest
  extends Request {
  user?: AuthenticatedUser;
  accessToken?: string;
}

/**
 * Authentication Middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // =====================================================
    // 1. Get Authorization Header
    // =====================================================

    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    // =====================================================
    // 2. Check Bearer Token Format
    // =====================================================

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
      });
    }

    // =====================================================
    // 3. Extract Access Token
    // =====================================================

    const token = authorization.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    // =====================================================
    // 4. Verify JWT
    // =====================================================

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
      });
    }

    // =====================================================
    // 5. Find User
    // =====================================================

    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        deleted_at: null,
        is_active: true,
      },
      include: {
        role: true,
      },
    });

    // =====================================================
    // 6. Check User
    // =====================================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or inactive',
      });
    }

    // =====================================================
    // 7. Check User Role
    // =====================================================

    if (!user.role) {
      return res.status(403).json({
        success: false,
        message: 'User role is not assigned',
      });
    }

    // =====================================================
    // 8. Check Role Soft Delete
    // =====================================================

    if (user.role.deleted_at) {
      return res.status(403).json({
        success: false,
        message: 'User role is inactive',
      });
    }

    // =====================================================
    // 9. Check User Session
    // =====================================================

    const session = await prisma.userSession.findFirst({
      where: {
        user_id: user.id,
        access_token: token,
        revoked_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    // =====================================================
    // 10. Session Not Found
    // =====================================================

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session is invalid, expired, or revoked',
      });
    }

    // =====================================================
    // 11. Resolve Tenant Context & Assigned Branch IDs
    // =====================================================

    const ownedTenant = await prisma.tenant.findFirst({
      where: {
        owner_id: user.id,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    let tenantId = ownedTenant?.id || payload.tenant_id;
    let assignedBranchIds: string[] = [];

    const staffRecords = await prisma.staff.findMany({
      where: {
        user_id: user.id,
        deleted_at: null,
      },
      select: {
        branch_id: true,
        branch: {
          select: { tenant_id: true },
        },
        managed_branches: {
          where: { deleted_at: null },
          select: { id: true, tenant_id: true },
        },
        executive_branches: {
          where: { deleted_at: null },
          select: { branch_id: true, branch: { select: { tenant_id: true } } },
        },
      },
    });

    const managerAssignments = user.role.name?.toUpperCase() === 'BRANCH_MANAGER'
      ? await prisma.branch.findMany({
          where: { manager: { user_id: user.id }, deleted_at: null },
          select: { id: true, tenant_id: true },
        })
      : [];

    for (const staff of staffRecords) {
      if (staff.branch_id) {
        assignedBranchIds.push(staff.branch_id);
        if (!tenantId && staff.branch?.tenant_id) {
          tenantId = staff.branch.tenant_id;
        }
      }
      for (const mb of staff.managed_branches) {
        assignedBranchIds.push(mb.id);
        if (!tenantId && mb.tenant_id) {
          tenantId = mb.tenant_id;
        }
      }
      for (const eb of staff.executive_branches) {
        assignedBranchIds.push(eb.branch_id);
        if (!tenantId && eb.branch?.tenant_id) {
          tenantId = eb.branch.tenant_id;
        }
      }
    }

    for (const branch of managerAssignments) {
      assignedBranchIds.push(branch.id);
      if (!tenantId) tenantId = branch.tenant_id;
    }

    assignedBranchIds = Array.from(new Set(assignedBranchIds));

    // =====================================================
    // 12. Check Tenant Active / Suspended Status
    // =====================================================

    const isSuperAdmin = user.role.name?.toUpperCase() === 'SUPER_ADMIN';

    if (!isSuperAdmin && tenantId) {
      const tenantRecord = await prisma.tenant.findFirst({
        where: {
          id: tenantId,
          deleted_at: null,
        },
        select: {
          is_active: true,
          status: true,
        },
      });

      if (tenantRecord && (!tenantRecord.is_active || tenantRecord.status === 'SUSPENDED')) {
        return res.status(403).json({
          success: false,
          message: 'Restaurant organization account is currently suspended. Please contact platform administration.',
        });
      }
    }

    // =====================================================
    // 13. Attach User to Request
    // =====================================================

    const authenticatedRequest = req as AuthenticatedRequest;

    authenticatedRequest.user = {
      id: user.id,
      roleId: user.role_id,
      roleName: user.role.name,
      tenantId,
      assignedBranchIds,
    };

    authenticatedRequest.accessToken = token;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};