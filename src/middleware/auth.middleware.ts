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
 *
 * Security checks:
 *
 * 1. Authorization header exists
 * 2. Bearer token format is valid
 * 3. JWT is valid
 * 4. User exists
 * 5. User is not soft deleted
 * 6. User is active
 * 7. User role exists
 * 8. User role is not soft deleted
 * 9. User session exists
 * 10. Session is not revoked
 * 11. Session is not expired
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

    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    // =====================================================
    // 2. Check Bearer Token Format
    // =====================================================

    if (
      !authorization.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
      });
    }

    // =====================================================
    // 3. Extract Access Token
    // =====================================================

    const token =
      authorization.substring(7).trim();

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
      payload =
        verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid or expired access token',
      });
    }

    // =====================================================
    // 5. Find User
    // =====================================================

    const user =
      await prisma.user.findFirst({
        where: {
          id: payload.userId,

          // Soft delete check
          deleted_at: null,

          // Account must be active
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
        message:
          'User account not found or inactive',
      });
    }

    // =====================================================
    // 7. Check User Role
    // =====================================================

    if (!user.role) {
      return res.status(403).json({
        success: false,
        message:
          'User role is not assigned',
      });
    }

    // =====================================================
    // 8. Check Role Soft Delete
    // =====================================================

    if (user.role.deleted_at) {
      return res.status(403).json({
        success: false,
        message:
          'User role is inactive',
      });
    }

    // =====================================================
    // 9. Check User Session
    // =====================================================

    const session =
      await prisma.userSession.findFirst({
        where: {
          user_id: user.id,

          access_token: token,

          // Session must not be revoked
          revoked_at: null,

          // Session must not be expired
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
        message:
          'Session is invalid, expired, or revoked',
      });
    }

    // =====================================================
    // 11. Attach User to Request
    // =====================================================

    const authenticatedRequest =
      req as AuthenticatedRequest;

    authenticatedRequest.user = {
      id: user.id,
      roleId: user.role_id,
      roleName: user.role.name,
    };

    // =====================================================
    // 12. Attach Access Token
    // =====================================================

    authenticatedRequest.accessToken =
      token;

    // =====================================================
    // 13. Continue
    // =====================================================

    next();
  } catch (error) {
    console.error(
      'Authentication middleware error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Authentication failed',
    });
  }
};