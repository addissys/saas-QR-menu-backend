import { Router } from 'express';

import {
  getNotifications,
  getNotification,
  create,
  markAsRead,
  markAllAsRead,
  remove,
} from '../controllers/notification.controller';

import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

/**
 * All notification endpoints require authentication
 */
router.use(authenticate);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
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
 *         name: is_read
 *         schema:
 *           type: boolean
 *         description: Filter by read/unread status
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch notifications
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Get a single notification by ID
 *     tags: [Notifications]
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
 *         description: Notification retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Failed to fetch notification
 */
router.get('/:id', getNotification);

/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
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
 *               - title
 *               - message
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *                 example: New Order Received
 *               message:
 *                 type: string
 *                 example: Table 5 placed a new order.
 *               type:
 *                 type: string
 *                 enum: [SYSTEM, SUBSCRIPTION, BRANCH, MENU, PROMOTION, ALERT]
 *                 default: SYSTEM
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to create notification
 */
router.post('/', create);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to mark all as read
 */
router.patch('/read-all', markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Failed to mark as read
 */
router.patch('/:id/read', markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Failed to delete notification
 */
router.delete('/:id', remove);

export default router;