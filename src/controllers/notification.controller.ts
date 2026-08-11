import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth.middleware';

import {
  getUserNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/notification.service';

import {
  createNotificationSchema,
} from '../validators/notification.validator';

/**
 * GET /api/v1/notifications
 *
 * Get notifications belonging to the logged-in user.
 */
export const getNotifications = async (
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

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const result = await getUserNotifications(
      userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'Get notifications error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
    });
  }
};


/**
 * GET /api/v1/notifications/:id
 *
 * Get one notification belonging to the logged-in user.
 */
export const getNotification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
    }

    const notification =
      await getNotificationById(
        id,
        userId
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification retrieved successfully',
      data: {
        notification,
      },
    });
  } catch (error) {
    console.error(
      'Get notification error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification',
    });
  }
};


/**
 * POST /api/v1/notifications
 *
 * Create a notification.
 */
export const create = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const validation =
      createNotificationSchema.safeParse(
        req.body
      );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten(),
      });
    }

    const notification =
      await createNotification(
        validation.data
      );

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification,
      },
    });
  } catch (error) {
    console.error(
      'Create notification error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create notification',
    });
  }
};


/**
 * PATCH /api/v1/notifications/:id/read
 *
 * Mark one notification as read.
 */
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
    }

    const notification =
      await markNotificationAsRead(
        id,
        userId
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification,
      },
    });
  } catch (error) {
    console.error(
      'Mark notification as read error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to mark notification as read',
    });
  }
};


/**
 * PATCH /api/v1/notifications/read-all
 *
 * Mark all notifications belonging to
 * the logged-in user as read.
 */
export const markAllAsRead = async (
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

    const result =
      await markAllNotificationsAsRead(
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        'All notifications marked as read',
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    console.error(
      'Mark all notifications as read error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to mark all notifications as read',
    });
  }
};


/**
 * DELETE /api/v1/notifications/:id
 *
 * Soft delete a notification.
 */
export const remove = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
    }

    const notification =
      await deleteNotification(
        id,
        userId
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Notification deleted successfully',
    });
  } catch (error) {
    console.error(
      'Delete notification error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to delete notification',
    });
  }
};