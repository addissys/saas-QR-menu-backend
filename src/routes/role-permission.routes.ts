import { Router } from 'express';

import {
  getPermissionsByRole,
  assignPermissions,
  revokePermission,
  listPermissions,
  listGrantablePermissions,
} from '../controllers/role-permission.controller';

import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Role Permissions
 *   description: Assign / revoke permissions on roles
 */

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     summary: List all system permissions
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions listed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       permission:
 *                         type: string
 *                         example: "menu.create"
 *                       module:
 *                         type: string
 *                         example: "menu"
 *                       action:
 *                         type: string
 *                         example: "create"
 *                       description:
 *                         type: string
 *       401:
 *         description: Authentication required
 */
router.get('/permissions', authenticate, listPermissions);

/**
 * @swagger
 * /api/v1/permissions/grantable:
 *   get:
 *     summary: List permissions the current user can grant
 *     description: >
 *       Returns only permissions the current authenticated user is authorised to grant.
 *       SUPER_ADMIN receives all permissions; other roles receive the union of their
 *       role permissions and user-level permissions. Used by frontend to populate the
 *       Additional Permissions selector.
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grantable permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       permission:
 *                         type: string
 *                       module:
 *                         type: string
 *                       action:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve grantable permissions
 */
// Returns only permissions the current user is authorised to grant
// (used by frontend to populate Additional Permissions selector)
router.get('/permissions/grantable', authenticate, listGrantablePermissions);

/**
 * All role-permission endpoints require authentication.
 *
 * Permission management should normally be restricted
 * to Super Admin.
 */

/**
 * @swagger
 * /api/v1/roles/{roleId}/permissions:
 *   get:
 *     summary: Get permissions assigned to a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       400:
 *         description: Invalid role ID
 *       404:
 *         description: Role not found
 *       500:
 *         description: Failed to retrieve role permissions
 */
router.get(
  '/roles/:roleId/permissions',
  authenticate,
  requireRoles('SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'),
  getPermissionsByRole
);

/**
 * @swagger
 * /api/v1/roles/{roleId}/permissions/assign:
 *   post:
 *     summary: Assign permissions to a role
 *     description: Bulk-assign one or more permissions to a role. Requires SUPER_ADMIN.
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The role ID to assign permissions to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_ids
 *             properties:
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of permission IDs to assign
 *     responses:
 *       200:
 *         description: Permissions assigned to role successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Role or permissions not found
 *       500:
 *         description: Failed to assign permissions
 */
router.post(
  '/roles/:roleId/permissions/assign',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  assignPermissions
);

/**
 * @swagger
 * /api/v1/roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     summary: Revoke a permission from a role
 *     description: Remove a single permission assignment from a role. Requires SUPER_ADMIN.
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The role ID
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The permission ID to revoke
 *     responses:
 *       200:
 *         description: Permission revoked from role successfully
 *       400:
 *         description: Invalid role ID or permission ID
 *       404:
 *         description: Role, permission, or assignment not found
 *       500:
 *         description: Failed to revoke permission
 */
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  revokePermission
);

export default router;