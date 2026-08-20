import { Router } from 'express';

import {
  getRoles,
  createNewRole,
  updateExistingRole,
  removeRole,
} from '../controllers/user-role.controller';

import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: User role and RBAC management
 */

/**
 * @swagger
 * /api/v1/user-roles:
 *   get:
 *     summary: Get all user roles
 *     description: Retrieve all available system roles.
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
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
 *                   example: Roles retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: CAFE_OWNER
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: Restaurant owner role
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve roles
 */
router.get(
  '/',
  authenticate,
  getRoles
);

/**
 * @swagger
 * /api/v1/user-roles:
 *   post:
 *     summary: Create a user role
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: BRANCH_MANAGER
 *               description:
 *                 type: string
 *                 example: Manages daily branch operations
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Role already exists
 *       500:
 *         description: Failed to create role
 */
router.post(
  '/',
  authenticate,
  createNewRole
);

/**
 * @swagger
 * /api/v1/user-roles/{id}:
 *   patch:
 *     summary: Update a user role
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
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: SENIOR_MANAGER
 *               description:
 *                 type: string
 *                 example: Updated role description
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Validation failed or invalid role ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role already exists
 *       500:
 *         description: Failed to update role
 */
router.patch(
  '/:id',
  authenticate,
  updateExistingRole
);

/**
 * @swagger
 * /api/v1/user-roles/{id}:
 *   delete:
 *     summary: Delete a user role
 *     description: Delete a role when it is not assigned to any active user. System roles cannot be deleted.
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
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Invalid role ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role is assigned to users and cannot be deleted
 *       500:
 *         description: Failed to delete role
 */
router.delete(
  '/:id',
  authenticate,
  removeRole
);

export default router;