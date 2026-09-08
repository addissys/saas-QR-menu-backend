import { Router } from 'express';

import {
  getPermissionsByRole,
  assignPermissions,
  revokePermission,
  listPermissions,
} from '../controllers/role-permission.controller';

import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.get('/permissions', authenticate, listPermissions);

/**
 * All role-permission endpoints require authentication.
 *
 * Permission management should normally be restricted
 * to Super Admin.
 */

/**
 * GET
 * /roles/:roleId/permissions
 */
router.get(
  '/roles/:roleId/permissions',
  authenticate,
  requireRoles('SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'),
  getPermissionsByRole
);

/**
 * POST
 * /roles/:roleId/permissions/assign
 */
router.post(
  '/roles/:roleId/permissions/assign',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  assignPermissions
);

/**
 * DELETE
 * /roles/:roleId/permissions/:permissionId
 */
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  revokePermission
);

export default router;