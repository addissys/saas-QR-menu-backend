import { Router } from 'express';

import upload from '../middleware/upload.middleware';

import {
  uploadMenuItemImage,
} from '../controllers/image.controller';

const router = Router();

router.post(
  '/menu-items/:menuItemId/image',
  upload.single('image'),
  uploadMenuItemImage
);

export default router;