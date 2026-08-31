import prisma from '../config/prisma';

/**
 * List active user sessions
 * If userId is provided, return sessions for that user.
 */
export const getUserSessions = async (userId?: string) => {
  const where: any = {
    revoked_at: null,
    expires_at: {
      gt: new Date(),
    },
  };

  if (userId) {
    where.user_id = userId;
  }

  return prisma.userSession.findMany({
    where,
    select: {
      id: true,
      user_id: true,
      ip_address: true,
      user_agent: true,
      device_name: true,
      expires_at: true,
      created_at: true,
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * Revoke a specific session by ID
 */
export const revokeSession = async (sessionId: string, userId?: string) => {
  const session = await prisma.userSession.findFirst({
    where: {
      id: sessionId,
      ...(userId && { user_id: userId }),
      revoked_at: null,
    },
  });

  if (!session) {
    throw new Error('Session not found or already revoked');
  }

  return prisma.userSession.update({
    where: {
      id: sessionId,
    },
    data: {
      revoked_at: new Date(),
    },
  });
};

/**
 * Logout from all devices (Revoke all active sessions for a user)
 */
export const revokeAllUserSessions = async (userId: string) => {
  return prisma.userSession.updateMany({
    where: {
      user_id: userId,
      revoked_at: null,
    },
    data: {
      revoked_at: new Date(),
    },
  });
};
