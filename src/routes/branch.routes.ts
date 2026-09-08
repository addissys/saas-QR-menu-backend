import { Router } from 'express';

import {
  listBranches,
  getBranch,
  createBranchController,
  updateBranchController,
  deleteBranch,
} from '../controllers/branch.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management for restaurants
 */

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: List all branches
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: tenant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by tenant (restaurant)
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *     responses:
 *       200:
 *         description: Branches listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch branches
 */
router.get(
  '/',
  listBranches
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Get a single branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID
 *     responses:
 *       200:
 *         description: Branch retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Failed to fetch branch
 */
router.get(
  '/:id',
  getBranch
);

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenant_id
 *               - name
 *               - address
 *               - city
 *               - country
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               name:
 *                 type: string
 *                 example: Bole Branch
 *               address:
 *                 type: string
 *                 example: Bole Road, Addis Ababa
 *               city:
 *                 type: string
 *                 example: Addis Ababa
 *               country:
 *                 type: string
 *                 example: Ethiopia
 *               phone:
 *                 type: string
 *                 example: "+251911000001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: bole@addiscoffee.com
 *               is_main:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to create branch
 */
router.post(
  '/',
  createBranchController
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   patch:
 *     summary: Update a branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               is_active:
 *                 type: boolean
 *               is_main:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Failed to update branch
 */
router.patch(
  '/:id',
  updateBranchController
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   delete:
 *     summary: Soft delete a branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Failed to delete branch
 */
router.delete(
  '/:id',
  deleteBranch
);

export default router;