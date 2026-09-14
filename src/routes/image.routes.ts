import { Router } from 'express';

import upload from '../middleware/upload.middleware';

import {
  uploadMenuItemImage,
} from '../controllers/image.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image upload management
 */

/**
 * @swagger
 * /api/v1/images/menu-items/{menuItemId}/image:
 *   post:
 *     summary: Upload an image for a menu item
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The menu item ID to attach the image to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (JPEG, PNG, WebP)
 *     responses:
 *       200:
 *         description: Menu item image uploaded successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     menuItem:
 *                       $ref: '#/components/schemas/MenuItem'
 *                     image:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                         original_name:
 *                           type: string
 *                         mime_type:
 *                           type: string
 *                         size:
 *                           type: integer
 *                         url:
 *                           type: string
 *       400:
 *         description: Invalid menu item ID or missing image file
 */
router.post(
  '/menu-items/:menuItemId/image',
  upload.single('image'),
  uploadMenuItemImage
);

export default router;