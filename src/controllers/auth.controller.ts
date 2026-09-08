import {
  Request,
  Response,
} from 'express';

import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from '../validators/auth.validator';

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../services/auth.service';

import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { resendEmailVerification } from '../services/email-verification.service';

const isDatabaseUnavailableError = (error: unknown) => {
  const err = error as {
    name?: string;
    code?: string;
    message?: string;
  };

  return (
    err.name === 'PrismaClientInitializationError' ||
    err.code === 'P1001' ||
    Boolean(err.message?.includes("Can't reach database server"))
  );
};

const isMissingEmailVerificationTableError = (error: unknown) => {
  const err = error as { code?: string; message?: string };

  return (
    err.code === 'P2021' &&
    err.message?.includes('email_verification_tokens')
  );
};

const databaseUnavailableResponse = (res: Response) =>
  res.status(503).json({
    success: false,
    message:
      'Database is unavailable. Check DATABASE_URL and make sure the Postgres server accepts connections.',
  });

/**
 * Register
 */
export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const validation =
      registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const user =
      await registerUser(validation.data);

    return res.status(201).json({
      success: true,
      message:
        'Cafe Owner registered successfully',
      data: {
        user,
      },
    });
  } catch (error: any) {
    console.error(
      'Register error:',
      error
    );

    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse(res);
    }

    if (isMissingEmailVerificationTableError(error)) {
      return res.status(503).json({
        success: false,
        message:
          'Registration is temporarily unavailable. Apply the email verification database migration first.',
      });
    }

    if (
      error.message === 'SMTP credentials are not configured' ||
      error.message === 'Failed to send email verification message'
    ) {
      return res.status(503).json({
        success: false,
        message:
          'Account creation requires a working email service. Check the SMTP configuration and try again.',
      });
    }

    if (
      error.message.includes(
        'already registered'
      ) ||
      error.message.includes(
        'CAFE_OWNER role'
      )
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

/**
 * Login
 */
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const validation =
      loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const result =
      await loginUser(
        validation.data.email,
        validation.data.password,
        req.ip,
        req.headers['user-agent'],
        req.headers['x-device-name'] as
          | string
          | undefined
      );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    console.error(
      'Login error:',
      error
    );

    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse(res);
    }

    if (
      error.message ===
        'Invalid email or password' ||
      error.message ===
        'Your account is inactive'
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * Logout
 */
export const logout = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (
      !req.user ||
      !req.accessToken
    ) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    await logoutUser(
      req.user.id,
      req.accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error(
      'Logout error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * Refresh token
 */
export const refreshToken = async (
  req: Request,
  res: Response
) => {
  try {
    const validation =
      refreshTokenSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result =
      await refreshAccessToken(
        validation.data.refresh_token
      );

    return res.status(200).json({
      success: true,
      message:
        'Access token refreshed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error(
      'Refresh token error:',
      error
    );

    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse(res);
    }

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Current profile
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const user =
      await getCurrentUser(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        'Profile retrieved successfully',
      data: {
        user,
      },
    });
  } catch (error: any) {
    console.error(
      'Get profile error:',
      error
    );

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update profile
 */
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const validation =
      updateProfileSchema.safeParse(
        req.body
      );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const user =
      await updateProfile(
        req.user.id,
        validation.data
      );

    return res.status(200).json({
      success: true,
      message:
        'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error: any) {
    console.error(
      'Update profile error:',
      error
    );

    if (
      error.message.includes(
        'already registered'
      )
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

/**
 * Change password
 */
export const updatePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const validation =
      changePasswordSchema.safeParse(
        req.body
      );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    await changePassword(
      req.user.id,
      validation.data.current_password,
      validation.data.new_password
    );

    return res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login again.',
    });
  } catch (error: any) {
    console.error(
      'Change password error:',
      error
    );

    if (
      error.message ===
      'Current password is incorrect'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};

/**
 * Forgot password
 */
export const forgotPasswordRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const validation =
      forgotPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    await forgotPassword(
      validation.data.email.toLowerCase().trim()
    );

    return res.status(200).json({
      success: true,
      message:
        'If this email is registered, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error(
      'Forgot password error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
    });
  }
};

/**
 * Reset password
 */
export const resetPasswordHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const validation =
      resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    await resetPassword(
      validation.data.token,
      validation.data.new_password
    );

    return res.status(200).json({
      success: true,
      message:
        'Password reset successfully. Please log in with your new password.',
    });
  } catch (error: any) {
    console.error(
      'Reset password error:',
      error
    );

    if (
      error.message === 'Invalid or expired reset token' ||
      error.message === 'Reset token has expired'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'User account is inactive') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

/**
 * Verify an email address from the link sent after account creation.
 */
export const verifyEmailHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const queryToken = typeof req.query.token === 'string' ? req.query.token : '';
    const bodyToken = typeof req.body?.token === 'string' ? req.body.token : '';
    const paramToken = typeof req.params.token === 'string' ? req.params.token : '';
    const token = queryToken || bodyToken || paramToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    await verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);

    if (
      error.message === 'Invalid or expired verification token' ||
      error.message === 'Verification token has expired'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to verify email',
    });
  }
};

/**
 * Resend verification email for an unverified account.
 */
export const resendVerificationEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = resendVerificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    await resendEmailVerification(validation.data.email);

    return res.status(200).json({
      success: true,
      message: 'If the email is registered and unverified, a verification email has been sent.',
    });
  } catch (error: any) {
    console.error('Resend verification email error:', error);

    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse(res);
    }

    if (
      error.message === 'SMTP credentials are not configured' ||
      error.message === 'Failed to send email verification message'
    ) {
      return res.status(503).json({
        success: false,
        message: 'Email service is unavailable. Check the SMTP configuration and try again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
    });
  }
};
