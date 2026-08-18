import { Router } from 'express';

import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateUserProfile,
  updatePassword,
  forgotPasswordRequest,
  resetPasswordHandler,
} from '../controllers/auth.controller';

import { authenticate } from '../middleware/auth.middleware';

import { authRateLimiter } from '../middleware/security.middleware';

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and account management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new Cafe Owner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "+251911000000"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Cafe Owner registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email or phone already registered
 *       500:
 *         description: Registration failed
 */
router.post(
  '/register',
  authRateLimiter,
  register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and receive access & refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful — returns access_token and refresh_token
 *       401:
 *         description: Invalid email or password / Account inactive
 *       500:
 *         description: Login failed
 */
router.post(
  '/login',
  authRateLimiter,
  login
);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh-token',
  authRateLimiter,
  refreshToken
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: If the email is registered, a reset link has been sent
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Failed to process forgot password request
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  forgotPasswordRequest
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using a token from the reset email
 *     tags: [Auth]
 *     description: |
 *       Submit the plain token received in the reset-password email link
 *       along with the new password. The token is single-use and expires
 *       after 15 minutes. On success, all existing sessions are revoked.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *               - confirm_password
 *             properties:
 *               token:
 *                 type: string
 *                 description: The plain reset token from the email link
 *                 example: a1b2c3d4e5f6...
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *                 example: newSecurePass123
 *               confirm_password:
 *                 type: string
 *                 example: newSecurePass123
 *     responses:
 *       200:
 *         description: Password reset successfully — user must log in again
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successfully. Please log in with your new password.
 *       400:
 *         description: Validation failed, token is invalid, or token has expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired reset token
 *       403:
 *         description: User account is inactive
 *       500:
 *         description: Failed to reset password
 */
router.post(
  '/reset-password',
  authRateLimiter,
  resetPasswordHandler
);

/*
|--------------------------------------------------------------------------
| Protected Authentication Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and revoke the current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Logout failed
 */
router.post(
  '/logout',
  authenticate,
  logout
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get the current authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get(
  '/me',
  authenticate,
  getProfile
);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   patch:
 *     summary: Update the current user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Updated
 *               phone:
 *                 type: string
 *                 example: "+251911000001"
 *               profile_image:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Phone already registered
 *       500:
 *         description: Failed to update profile
 */
router.patch(
  '/profile',
  authenticate,
  updateUserProfile
);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   patch:
 *     summary: Change the current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: oldpass123
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *                 example: newpass456
 *     responses:
 *       200:
 *         description: Password changed successfully. Please login again.
 *       400:
 *         description: Validation failed or current password is incorrect
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to change password
 */
router.patch(
  '/change-password',
  authenticate,
  updatePassword
);

export default router;