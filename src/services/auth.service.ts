import crypto from 'crypto';
import bcrypt from 'bcrypt';

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
import { sendPasswordResetEmail } from './email.service';
import { createEmailVerification, verifyEmail } from './email-verification.service';

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

  await createEmailVerification(user.id, user.email);

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
      owned_tenants: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          business_name: true,
        },
      },
      staff_profile: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              tenant_id: true,
              branch_name: true,
              address: true,
              city: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.deleted_at) {
    throw new Error('Invalid email or password');
  }

  if (!user.is_active) {
    throw new Error('Your account is inactive');
  }

  const isSuperAdmin = user.role.name.toUpperCase() === 'SUPER_ADMIN';

  if (!isSuperAdmin && !user.email_verified_at) {
    throw new Error('Please verify your email address before logging in');
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

  const permissions = await getEffectivePermissions(user.id, user.role_id);

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
      owned_tenants: user.owned_tenants,
      staff_profile: user.staff_profile,
      permissions,
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
 * Compute effective permissions for a user:
 * effectivePermissions = rolePermissions UNION userPermissions
 */
export const getEffectivePermissions = async (userId: string, roleId: string): Promise<string[]> => {
  const [rolePerms, userPerms] = await Promise.all([
    prisma.rolePermission.findMany({
      where: { role_id: roleId, deleted_at: null, permission: { deleted_at: null } },
      select: { permission: { select: { permission: true } } },
    }),
    prisma.userPermission.findMany({
      where: { user_id: userId, deleted_at: null, permission: { deleted_at: null } },
      select: { permission: { select: { permission: true } } },
    }),
  ]);

  const codes = new Set<string>();
  for (const rp of rolePerms) codes.add(rp.permission.permission);
  for (const up of userPerms) codes.add(up.permission.permission);
  return Array.from(codes);
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

      staff_profile: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              tenant_id: true,
              branch_name: true,
              address: true,
              city: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const permissions = await getEffectivePermissions(userId, user.role.id);

  return { ...user, permissions };
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

/**
 * Forgot Password
 */
export const forgotPassword = async (
  email: string
) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  /*
   * Do not reveal whether the email exists.
   *
   * This prevents attackers from discovering
   * registered email addresses.
   */
  if (!user) {
    return;
  }

  // Generate secure random token
  const resetToken =
    crypto.randomBytes(32).toString('hex');

  // Hash token before storing it in database
  const tokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires after 15 minutes
  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  // Delete previous unused reset tokens
  await prisma.passwordResetToken.deleteMany({
    where: {
      user_id: user.id,
      used_at: null,
    },
  });

  // Store hashed token
  await prisma.passwordResetToken.create({
    data: {
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  const resetLink =
    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail(
    user.email,
    resetLink
  );
};

/**
 * Reset Password
 *
 * Validates the plain token from the URL (by hashing it and comparing
 * with the stored hash), updates the user's password, marks the token
 * as used, and revokes all active sessions.
 */
export const resetPassword = async (
  plainToken: string,
  newPassword: string
) => {
  // Re-hash the plain token the same way forgotPassword stored it
  const tokenHash = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');

  // Find a valid, unused reset token record
  const record =
    await prisma.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        used_at: null,
      },
      include: {
        user: true,
      },
    });

  if (!record) {
    throw new Error('Invalid or expired reset token');
  }

  // Check expiry
  if (record.expires_at < new Date()) {
    throw new Error('Reset token has expired');
  }

  // Check user is still active
  if (!record.user.is_active || record.user.deleted_at) {
    throw new Error('User account is inactive');
  }

  const newPasswordHash = await hashPassword(newPassword);

  // Update password and mark token as used in a transaction
  await prisma.$transaction([
    // Update the user's password
    prisma.user.update({
      where: { id: record.user_id },
      data: { password: newPasswordHash },
    }),

    // Mark this token as consumed
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used_at: new Date() },
    }),

    // Revoke all active sessions so the old password can't be reused
    prisma.userSession.updateMany({
      where: {
        user_id: record.user_id,
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    }),
  ]);
};

export { verifyEmail };