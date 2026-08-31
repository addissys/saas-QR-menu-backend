import { Router } from 'express';
import {
  listQrCodesController,
  getQrCodeByIdController,
  generateQrCodeController,
  downloadQrImageController,
  regenerateQrByIdController,
  deleteQrByIdController,
} from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: QR Codes
 *   description: QR code management for restaurant tables
 */

/**
 * @swagger
 * /api/v1/qr-codes:
 *   get:
 *     summary: List all QR codes
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter QR codes by branch
 *     responses:
 *       200:
 *         description: QR codes listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve QR codes
 */
router.get('/', authenticate, listQrCodesController);

/**
 * @swagger
 * /api/v1/qr-codes/generate:
 *   post:
 *     summary: Generate a QR code for a table
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - table_id
 *             properties:
 *               table_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: QR code generated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to generate QR code
 */
router.post('/generate', authenticate, generateQrCodeController);

/**
 * @swagger
 * /api/v1/qr-codes/{id}:
 *   get:
 *     summary: Get QR code details by ID
 *     tags: [QR Codes]
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
 *         description: QR code retrieved successfully
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Failed to retrieve QR code
 */
router.get('/:id', authenticate, getQrCodeByIdController);

/**
 * @swagger
 * /api/v1/qr-codes/{id}/regenerate:
 *   patch:
 *     summary: Regenerate QR code
 *     tags: [QR Codes]
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
 *         description: QR code regenerated successfully
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Failed to regenerate QR code
 */
router.patch('/:id/regenerate', authenticate, regenerateQrByIdController);

/**
 * @swagger
 * /api/v1/qr-codes/{id}/download:
 *   get:
 *     summary: Download QR code image
 *     tags: [QR Codes]
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
 *         description: QR image returned successfully
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Failed to download QR image
 */
router.get('/:id/download', authenticate, downloadQrImageController);

/**
 * @swagger
 * /api/v1/qr-codes/{id}:
 *   delete:
 *     summary: Soft delete QR code
 *     tags: [QR Codes]
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
 *         description: QR code deleted successfully
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Failed to delete QR code
 */
router.delete('/:id', authenticate, deleteQrByIdController);

export default router;
