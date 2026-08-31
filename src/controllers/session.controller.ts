import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  getUserSessions,
  revokeSession,
  revokeAllUserSessions,
} from '../services/session.service';

/**
 * GET /sessions (List active sessions)
 */
export const listSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const sessions = await getUserSessions(userId);

    return res.status(200).json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: sessions,
    });
  } catch (error: any) {
    console.error('List sessions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve active sessions',
    });
  }
};

/**
 * DELETE /sessions/:id (Revoke session)
 */
export const revokeSessionController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    await revokeSession(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error: any) {
    console.error('Revoke session error:', error);
    if (error.message === 'Session not found or already revoked') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to revoke session',
    });
  }
};

/**
 * DELETE /sessions (Logout from all devices)
 */
export const logoutAllDevicesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    await revokeAllUserSessions(userId);

    return res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error: any) {
    console.error('Logout all devices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to logout from all devices',
    });
  }
};
