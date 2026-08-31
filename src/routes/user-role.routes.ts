import { Router } from 'express';

import {
  listUserRoleAssignments,
  assignUserRoleController,
  updateUserRoleAssignmentController,
  revokeUserRoleAssignmentController,
} from '../controllers/user-role.controller';

import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: User role assignment management
 */

/**
 * @swagger
 * /api/v1/user-roles:
 *   get:
 *     summary: List user role assignments
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User role assignments retrieved successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve user role assignments
 */
router.get('/', authenticate, listUserRoleAssignments);

/**
 * @swagger
 * /api/v1/user-roles:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               role_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Role assigned to user successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: User or role not found
 *       500:
 *         description: Failed to assign role
 */
router.post('/', authenticate, assignUserRoleController);

/**
 * @swagger
 * /api/v1/user-roles/{id}:
 *   patch:
 *     summary: Update role assignment for a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *             properties:
 *               role_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User role assignment updated successfully
 *       404:
 *         description: User or role not found
 *       500:
 *         description: Failed to update role assignment
 */
router.patch('/:id', authenticate, updateUserRoleAssignmentController);

/**
 * @swagger
 * /api/v1/user-roles/{id}:
 *   delete:
 *     summary: Revoke role assignment from a user (Soft Delete)
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User role assignment revoked successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to revoke role assignment
 */
router.delete('/:id', authenticate, revokeUserRoleAssignmentController);

export default router;