import { Router } from 'express';

import {
  listMenuItems,
  getMenuItem,
  createMenuItemController,
  updateMenuItemController,
  deleteMenuItemController,
  updateMenuItemAvailabilityController,
  updateMenuItemFeaturedController,
} from '../controllers/menu-item.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizePermission } from '../middleware/permission.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Menu Items
 *   description: Menu item management
 */

/**
 * @swagger
 * /api/v1/menu-items:
 *   get:
 *     summary: List all menu items
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by branch
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category
 *       - in: query
 *         name: is_available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: boolean
 *         description: Filter featured items
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
 *     responses:
 *       200:
 *         description: Menu items listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch menu items
 */
router.get(
  '/',
  listMenuItems
);

/**
 * @swagger
 * /api/v1/menu-items/{id}:
 *   get:
 *     summary: Get a single menu item by ID
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item UUID
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Failed to fetch menu item
 */
router.get(
  '/:id',
  getMenuItem
);

/**
 * @swagger
 * /api/v1/menu-items:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - branch_id
 *               - name
 *               - price
 *             properties:
 *               category_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               name:
 *                 type: string
 *                 example: Ethiopian Coffee
 *               description:
 *                 type: string
 *                 example: Traditional hand-brewed Ethiopian coffee
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 45.00
 *               image_url:
 *                 type: string
 *                 example: https://example.com/coffee.jpg
 *               is_available:
 *                 type: boolean
 *                 default: true
 *               is_featured:
 *                 type: boolean
 *                 default: false
 *               sort_order:
 *                 type: integer
 *                 example: 1
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["milk", "nuts"]
 *               calories:
 *                 type: integer
 *                 example: 120
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to create menu item
 */
router.post(
  '/',
  authorizePermission('menu_items.create'),
  createMenuItemController
);

/**
 * @swagger
 * /api/v1/menu-items/{id}:
 *   patch:
 *     summary: Update a menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               image_url:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *               calories:
 *                 type: integer
 *               category_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Failed to update menu item
 */
router.patch(
  '/:id',
  authorizePermission('menu_items.update'),
  updateMenuItemController
);

/**
 * @swagger
 * /api/v1/menu-items/{id}/availability:
 *   patch:
 *     summary: Toggle availability of a menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_available
 *             properties:
 *               is_available:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Failed to update availability
 */
router.patch('/:id/availability', authorizePermission('menu_items.update'), updateMenuItemAvailabilityController);

/**
 * @swagger
 * /api/v1/menu-items/{id}/featured:
 *   patch:
 *     summary: Toggle featured status of a menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_featured
 *             properties:
 *               is_featured:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Featured status updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Failed to update featured status
 */
router.patch('/:id/featured', authorizePermission('menu_items.update'), updateMenuItemFeaturedController);

/**
 * @swagger
 * /api/v1/menu-items/{id}:
 *   delete:
 *     summary: Soft delete a menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item UUID
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Failed to delete menu item
 */
router.delete(
  '/:id',
  authorizePermission('menu_items.delete'),
  deleteMenuItemController
);

export default router;