import { Router } from 'express';

import {
  listCategories,
  getCategory,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/category.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Menu category management
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: List all menu categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter categories by branch
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
 *         description: Categories listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch categories
 */
router.get(
  '/',
  listCategories
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get a single menu category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category UUID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to fetch category
 */
router.get(
  '/:id',
  getCategory
);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new menu category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branch_id
 *               - name
 *             properties:
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               name:
 *                 type: string
 *                 example: Hot Beverages
 *               description:
 *                 type: string
 *                 example: Coffees, teas, and hot drinks
 *               image_url:
 *                 type: string
 *                 example: https://example.com/category.jpg
 *               sort_order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to create category
 */
router.post(
  '/',
  createCategoryController
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Update a menu category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category UUID
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
 *               image_url:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to update category
 */
router.patch(
  '/:id',
  updateCategoryController
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Soft delete a menu category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category UUID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to delete category
 */
router.delete(
  '/:id',
  deleteCategoryController
);

export default router;