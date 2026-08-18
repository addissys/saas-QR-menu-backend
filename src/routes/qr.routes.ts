import { Router } from 'express';

import { authenticate } from '../middleware/auth.middleware';

import {
  generateQrController,
  getQrController,
  regenerateQrController,
  deleteQrController,
} from '../controllers/qr.controller';

const router = Router();

// Generate QR
router.post(
  '/tables/:tableId/generate',
  authenticate,
  generateQrController
);

// Get QR
router.get(
  '/tables/:tableId',
  getQrController
);

// Regenerate QR
router.post(
  '/tables/:tableId/regenerate',
  authenticate,
  regenerateQrController
);

// Delete QR
router.delete(
  '/tables/:tableId',
  authenticate,
  deleteQrController
);

export default router;