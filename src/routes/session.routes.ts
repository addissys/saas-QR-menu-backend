import { Router } from 'express';
import {
  listSessions,
  revokeSessionController,
  logoutAllDevicesController,
} from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User Sessions
 *   description: User session and device management
 */

/**
 * @swagger
 * /api/v1/sessions:
 *   get:
 *     summary: List active sessions
 *     tags: [User Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve sessions
 */
router.get('/', authenticate, listSessions);

/**
 * @swagger
 * /api/v1/sessions/{id}:
 *   delete:
 *     summary: Revoke session
 *     tags: [User Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session UUID
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Failed to revoke session
 */
router.delete('/:id', authenticate, revokeSessionController);

/**
 * @swagger
 * /api/v1/sessions:
 *   delete:
 *     summary: Logout from all devices
 *     tags: [User Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to logout from all devices
 */
router.delete('/', authenticate, logoutAllDevicesController);

export default router;
