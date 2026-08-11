import crypto from 'crypto';

import prisma from '../config/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  comparePassword,
  hashPassword,
} from '../utils/password';

/**
 * Register Cafe Owner
 */
export const registerUser = async (data: {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  const email = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error('Email is already registered');
  }

  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: data.phone,
      },
    });

    if (existingPhone) {
      throw new Error('Phone number is already registered');
    }
  }

  const cafeOwnerRole = await prisma.role.findFirst({
    where: {
      name: {
        equals: 'CAFE_OWNER',
        mode: 'insensitive',
      },
      deleted_at: null,
    },
  });

  if (!cafeOwnerRole) {
    throw new Error(
      'CAFE_OWNER role was not found. Please seed the roles table.'
    );
  }

  const passwordHash = await hashPassword(
    data.password
  );

  const user = await prisma.user.create({
    data: {
      full_name: data.full_name.trim(),
      email,
      phone: data.phone || null,
      password: passwordHash,
      role_id: cafeOwnerRole.id,
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      is_active: true,
      created_at: true,

      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return user;
};

/**
 * Login
 */
export const loginUser = async (
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
  deviceName?: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase().trim(),
    },
    include: {
      role: true,
    },
  });

  if (!user || user.deleted_at) {
    throw new Error('Invalid email or password');
  }

  if (!user.is_active) {
    throw new Error('Your account is inactive');
  }

  const passwordMatches = await comparePassword(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error('Invalid email or password');
  }

  const sessionId = crypto.randomUUID();

  const accessToken = generateAccessToken({
    userId: user.id,
    roleId: user.role_id,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId,
  });

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + 7
  );

  await prisma.userSession.create({
    data: {
      id: sessionId,
      user_id: user.id,
      access_token: accessToken,
      refresh_token: refreshToken,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      device_name: deviceName || null,
      expires_at: expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      profile_image: user.profile_image,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
    },

    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

/**
 * Logout
 */
export const logoutUser = async (
  userId: string,
  accessToken: string
) => {
  await prisma.userSession.updateMany({
    where: {
      user_id: userId,
      access_token: accessToken,
      revoked_at: null,
    },

    data: {
      revoked_at: new Date(),
    },
  });
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (
  refreshToken: string
) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('Invalid or expired refresh token');
  }

  const session = await prisma.userSession.findFirst({
    where: {
      id: payload.sessionId,
      user_id: payload.userId,
      refresh_token: refreshToken,
      revoked_at: null,
    },

    include: {
      user: true,
    },
  });

  if (!session) {
    throw new Error('Session is invalid or revoked');
  }

  if (
    session.expires_at < new Date()
  ) {
    throw new Error('Session has expired');
  }

  if (
    !session.user.is_active ||
    session.user.deleted_at
  ) {
    throw new Error('User account is inactive');
  }

  const newAccessToken =
    generateAccessToken({
      userId: session.user.id,
      roleId: session.user.role_id,
    });

  await prisma.userSession.update({
    where: {
      id: session.id,
    },

    data: {
      access_token: newAccessToken,
    },
  });

  return {
    access_token: newAccessToken,
  };
};

/**
 * Get current user
 */
export const getCurrentUser = async (
  userId: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deleted_at: null,
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      email_verified_at: true,
      is_active: true,
      created_at: true,
      updated_at: true,

      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },

      owned_tenants: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          business_name: true,
          business_slug: true,
          logo_url: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Update profile
 */
export const updateProfile = async (
  userId: string,
  data: {
    full_name?: string;
    phone?: string;
    profile_image?: string;
  }
) => {
  if (data.phone) {
    const existingPhone =
      await prisma.user.findFirst({
        where: {
          phone: data.phone,
          id: {
            not: userId,
          },
          deleted_at: null,
        },
      });

    if (existingPhone) {
      throw new Error(
        'Phone number is already registered'
      );
    }
  }

  return prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      ...(data.full_name !== undefined && {
        full_name: data.full_name.trim(),
      }),

      ...(data.phone !== undefined && {
        phone: data.phone || null,
      }),

      ...(data.profile_image !== undefined && {
        profile_image: data.profile_image || null,
      }),
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      is_active: true,
      updated_at: true,

      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Change password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deleted_at: null,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isCorrect =
    await comparePassword(
      currentPassword,
      user.password
    );

  if (!isCorrect) {
    throw new Error(
      'Current password is incorrect'
    );
  }

  const newPasswordHash =
    await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      password: newPasswordHash,
    },
  });

  // Revoke all existing sessions
  await prisma.userSession.updateMany({
    where: {
      user_id: userId,
      revoked_at: null,
    },

    data: {
      revoked_at: new Date(),
    },
  });
};