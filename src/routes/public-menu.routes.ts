import { Router } from 'express';

import {
  getPublicBranchesController,
  getBranchMenuController,
  getTableMenuController,
  searchPublicMenuController,
  getPublicMenuItemController,
} from '../controllers/public-menu.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Public Menu
 *   description: Public-facing menu APIs — no authentication required
 */

/**
 * @swagger
 * /api/v1/public/branches:
 *   get:
 *     summary: Get all publicly available branches
 *     tags: [Public Menu]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter branches by city
 *     responses:
 *       200:
 *         description: Branches retrieved successfully
 *       500:
 *         description: Failed to fetch branches
 */
router.get(
  '/branches',
  getPublicBranchesController
);

/**
 * @swagger
 * /api/v1/public/branches/{branchId}/menu:
 *   get:
 *     summary: Get the full menu for a branch
 *     tags: [Public Menu]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Failed to fetch menu
 */
router.get(
  '/branches/:branchId/menu',
  getBranchMenuController
);

/**
 * @swagger
 * /api/v1/public/branches/{branchId}/tables/{tableId}/menu:
 *   get:
 *     summary: Get the menu after scanning a table QR code
 *     tags: [Public Menu]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     responses:
 *       200:
 *         description: Table menu retrieved successfully
 *       404:
 *         description: Branch or table not found
 *       500:
 *         description: Failed to fetch table menu
 */
router.get(
  '/branches/:branchId/tables/:tableId/menu',
  getTableMenuController
);

router.get(
  '/tables/:tableId/menu',
  getTableMenuController
);

router.get(
  '/tables/:id',
  getTableMenuController
);

/**
 * @swagger
 * /api/v1/public/branches/{branchId}/menu-items/{menuItemId}:
 *   get:
 *     summary: Get details of a single public menu item
 *     tags: [Public Menu]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu Item UUID
 *     responses:
 *       200:
 *         description: Public menu item retrieved successfully
 *       404:
 *         description: Menu item not found or unavailable
 *       500:
 *         description: Failed to fetch menu item
 */
router.get(
  '/branches/:branchId/menu-items/:menuItemId',
  getPublicMenuItemController
);

/**
 * @swagger
 * /api/v1/public/search:
 *   get:
 *     summary: Search public menu items across a branch
 *     tags: [Public Menu]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword (item name or description)
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Limit search to a specific branch
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Search failed
 */
router.get(
  '/search',
  searchPublicMenuController
);

export default router;