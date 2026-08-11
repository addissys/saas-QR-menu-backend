import { Router } from 'express';

import {
  getPublicBranchesController,
  getBranchMenuController,
  getTableMenuController,
  searchPublicMenuController,
} from '../controllers/public-menu.controller';

const router = Router();

/*
 * Public Menu APIs
 *
 * No authentication required.
 */

// Get all publicly available branches
router.get(
  '/branches',
  getPublicBranchesController
);

// Get complete menu for a branch
router.get(
  '/branches/:branchId/menu',
  getBranchMenuController
);

// Get menu after scanning a table QR code
router.get(
  '/branches/:branchId/tables/:tableId/menu',
  getTableMenuController
);

// Search public menu items
router.get(
  '/search',
  searchPublicMenuController
);

export default router;