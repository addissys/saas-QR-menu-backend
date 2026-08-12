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
 * All notification endpoints require authentication
 */
router.use(authenticate);

/**
 * GET /notifications
 */
router.get('/', getNotifications);

/**
 * GET /notifications/:id
 */
router.get('/:id', getNotification);

/**
 * POST /notifications
 */
router.post('/', create);

/**
 * PATCH /notifications/read-all
 *
 * IMPORTANT:
 * This must come BEFORE /:id/read
 * and /:id routes so "read-all" isn't treated as an ID.
 */
router.patch('/read-all', markAllAsRead);

/**
 * PATCH /notifications/:id/read
 */
router.patch('/:id/read', markAsRead);

/**
 * DELETE /notifications/:id
 */
router.delete('/:id', remove);

export default router;