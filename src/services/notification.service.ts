import prisma from '../config/prisma';
import { CreateNotificationInput } from '../validators/notification.validator';

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },

      orderBy: {
        sent_at: 'desc',
      },

      skip,
      take: limit,
    }),

    prisma.notification.count({
      where: {
        user_id: userId,
        deleted_at: null,
      },
    }),

    prisma.notification.count({
      where: {
        user_id: userId,
        is_read: false,
        deleted_at: null,
      },
    }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    unread,
  };
};

/**
 * Get one notification
 */
export const getNotificationById = async (
  notificationId: string,
  userId: string
) => {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,
      user_id: userId,
      deleted_at: null,
    },
  });
};

/**
 * Create a notification
 */
export const createNotification = async (
  data: CreateNotificationInput
) => {
  return prisma.notification.create({
    data: {
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
    },
  });
};

/**
 * Mark one notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      user_id: userId,
      deleted_at: null,
    },
  });

  if (!notification) {
    return null;
  }

  if (notification.is_read) {
    return notification;
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },

    data: {
      is_read: true,
      read_at: new Date(),
    },
  });
};

/**
 * Mark all user's notifications as read
 */
export const markAllNotificationsAsRead = async (
  userId: string
) => {
  const result = await prisma.notification.updateMany({
    where: {
      user_id: userId,
      is_read: false,
      deleted_at: null,
    },

    data: {
      is_read: true,
      read_at: new Date(),
    },
  });

  return result;
};

/**
 * Soft delete notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      user_id: userId,
      deleted_at: null,
    },
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },

    data: {
      deleted_at: new Date(),
    },
  });
};