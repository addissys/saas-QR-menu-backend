import { Router } from 'express';

import {
  listAuditLogs,
  getAuditLog,
  createAuditLogController,
  deleteAuditLog,
} from '../controllers/audit-log.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: System audit log management
 */

/**
 * @swagger
 * /api/v1/audit-logs:
 *   get:
 *     summary: List all audit logs
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module name (e.g. auth, tenant)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action (e.g. CREATE, UPDATE, DELETE)
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       500:
 *         description: Failed to fetch audit logs
 */
router.get(
  '/',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  listAuditLogs
);

/**
 * @swagger
 * /api/v1/audit-logs/{id}:
 *   get:
 *     summary: Get a single audit log by ID
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 *       404:
 *         description: Audit log not found
 *       500:
 *         description: Failed to fetch audit log
 */
router.get(
  '/:id',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  getAuditLog
);

/**
 * @swagger
 * /api/v1/audit-logs:
 *   post:
 *     summary: Create an audit log entry
 *     tags: [Audit Logs]
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
 *               - module
 *               - action
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *               module:
 *                 type: string
 *                 example: auth
 *               action:
 *                 type: string
 *                 example: LOGIN
 *               entity_name:
 *                 type: string
 *                 example: User
 *               entity_id:
 *                 type: string
 *                 format: uuid
 *               old_values:
 *                 type: object
 *               new_values:
 *                 type: object
 *               ip_address:
 *                 type: string
 *               user_agent:
 *                 type: string
 *     responses:
 *       201:
 *         description: Audit log created successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Failed to create audit log
 */
router.post(
  '/',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  createAuditLogController
);

/**
 * @swagger
 * /api/v1/audit-logs/{id}:
 *   delete:
 *     summary: Soft delete an audit log
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Audit log deleted successfully
 *       404:
 *         description: Audit log not found
 *       500:
 *         description: Failed to delete audit log
 */
router.delete(
  '/:id',
  authenticate,
  requireRoles('SUPER_ADMIN'),
  deleteAuditLog
);

export default router;