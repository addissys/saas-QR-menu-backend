import { Router } from 'express';

import {
  listMenuItems,
  getMenuItem,
  createMenuItemController,
  updateMenuItemController,
  deleteMenuItemController,
} from '../controllers/menu-item.controller';

const router = Router();

router.get(
  '/',
  listMenuItems
);

router.get(
  '/:id',
  getMenuItem
);

router.post(
  '/',
  createMenuItemController
);

router.patch(
  '/:id',
  updateMenuItemController
);

router.delete(
  '/:id',
  deleteMenuItemController
);

export default router;