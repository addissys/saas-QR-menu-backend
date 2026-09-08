import { Router } from 'express';

import {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  removeUser,
  changeUserStatus,
  listUserPermissions,
  assignUserPermissionsController,
  revokeUserPermissionController,
} from '../controllers/user.controller';

import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all active users that have not been deleted.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       full_name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: "+251911000000"
 *                       profile_image:
 *                         type: string
 *                         nullable: true
 *                         example: https://example.com/profile.jpg
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                       email_verified_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: CAFE_OWNER
 *                           description:
 *                             type: string
 *                             nullable: true
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve users
 */
router.get(
  '/',
  authenticate,
  getUsers
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to retrieve user
 */
router.get(
  '/:id',
  authenticate,
  getUser
);

const userManagers = requireRoles('SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER');
router.get('/:id/permissions', authenticate, userManagers, listUserPermissions);
router.post('/:id/permissions', authenticate, userManagers, assignUserPermissionsController);
router.delete('/:id/permissions/:permissionId', authenticate, userManagers, revokeUserPermissionController);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               - role_id
 *             properties:
 *               full_name:
 *                 type: string
 *                 minLength: 2
 *                 example: Abebe Kebede
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abebe@example.com
 *               phone:
 *                 type: string
 *                 example: "+251911000000"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123
 *               role_id:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Role not found
 *       409:
 *         description: Email or phone already registered
 *       500:
 *         description: Failed to create user
 */
router.post(
  '/',
  authenticate,
  createNewUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Abebe Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abebe.updated@example.com
 *               phone:
 *                 type: string
 *                 example: "+251922000000"
 *               role_id:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation failed or invalid user ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User or role not found
 *       409:
 *         description: Email or phone already registered
 *       500:
 *         description: Failed to update user
 */
router.patch(
  '/:id',
  authenticate,
  updateExistingUser
);

/**
 * @swagger
 * /api/v1/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Validation failed or invalid user ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user status
 */
router.patch(
  '/:id/status',
  authenticate,
  changeUserStatus
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Soft delete a user account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 */
router.delete(
  '/:id',
  authenticate,
  removeUser
);

export default router;