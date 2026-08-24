import { Router } from 'express';

import { authenticate } from '../middleware/auth.middleware';

import {
  generateQrController,
  getQrController,
  regenerateQrController,
  deleteQrController,
} from '../controllers/qr.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: QR Codes
 *   description: QR code generation and management for restaurant tables
 */

/**
 * @swagger
 * /api/v1/qr/tables/{tableId}:
 *   get:
 *     summary: Get QR code for a table
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     table_id:
 *                       type: string
 *                       format: uuid
 *                     qr_url:
 *                       type: string
 *                     image_url:
 *                       type: string
 *                     public_url:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Authentication required
 *       404:
 *         description: QR code not found for this table
 *       500:
 *         description: Failed to fetch QR code
 */
router.get(
  '/tables/:tableId',
  getQrController
);

/**
 * @swagger
 * /api/v1/qr/tables/{tableId}/generate:
 *   post:
 *     summary: Generate a QR code for a table
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     responses:
 *       201:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     qr_url:
 *                       type: string
 *                       description: The public URL encoded in the QR code
 *                     image_url:
 *                       type: string
 *                       description: URL to the generated QR code image
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Table not found
 *       409:
 *         description: QR code already exists for this table — use regenerate
 *       500:
 *         description: Failed to generate QR code
 */
router.post(
  '/tables/:tableId/generate',
  authenticate,
  generateQrController
);

/**
 * @swagger
 * /api/v1/qr/tables/{tableId}/regenerate:
 *   post:
 *     summary: Regenerate (invalidate old and create new) QR code for a table
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     responses:
 *       200:
 *         description: QR code regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     qr_url:
 *                       type: string
 *                     image_url:
 *                       type: string
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Table or existing QR code not found
 *       500:
 *         description: Failed to regenerate QR code
 */
router.post(
  '/tables/:tableId/regenerate',
  authenticate,
  regenerateQrController
);

/**
 * @swagger
 * /api/v1/qr/tables/{tableId}:
 *   delete:
 *     summary: Soft delete (deactivate) a QR code for a table
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     responses:
 *       200:
 *         description: QR code deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Failed to delete QR code
 */
router.delete(
  '/tables/:tableId',
  authenticate,
  deleteQrController
);

export default router;