import { Request, Response, NextFunction } from 'express';

import prisma from '../config/prisma';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedRequest
  extends Request {
  user?: {
    id: string;
    roleId: string;
  };

  accessToken?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    if (
      !authorization.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
      });
    }

    const token =
      authorization.substring(7);

    const payload =
      verifyAccessToken(token);

    const session =
      await prisma.userSession.findFirst({
        where: {
          user_id: payload.userId,
          access_token: token,
          revoked_at: null,
        },

        include: {
          user: true,
        },
      });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session is invalid or revoked',
      });
    }

    if (
      session.expires_at < new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: 'Session has expired',
      });
    }

    if (
      !session.user.is_active ||
      session.user.deleted_at
    ) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    req.user = {
      id: payload.userId,
      roleId: payload.roleId,
    };

    req.accessToken = token;

    next();
  } catch (error) {
    console.error(
      'Authentication error:',
      error
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};