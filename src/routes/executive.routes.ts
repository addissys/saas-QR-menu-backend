import { Router } from 'express';

import {
  listExecutives,
  getExecutive,
  createExecutiveController,
  updateExecutiveController,
  deleteExecutiveController,
  assignBranchesController,
  removeBranchController,
} from '../controllers/executive.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Executives
 *   description: Executive staff management and branch assignments
 */

/**
 * @swagger
 * /api/v1/executives:
 *   get:
 *     summary: List all executives
 *     tags: [Executives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by tenant
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Executives listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch executives
 */
router.get(
  '/',
  listExecutives
);

/**
 * @swagger
 * /api/v1/executives/{id}:
 *   get:
 *     summary: Get a single executive by ID
 *     tags: [Executives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Executive UUID
 *     responses:
 *       200:
 *         description: Executive retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Executive not found
 *       500:
 *         description: Failed to fetch executive
 */
router.get(
  '/:id',
  getExecutive
);

/**
 * @swagger
 * /api/v1/executives:
 *   post:
 *     summary: Create a new executive
 *     tags: [Executives]
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
 *               - user_id
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *                 example: Regional Director
 *     responses:
 *       201:
 *         description: Executive created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       409:
 *         description: User is already an executive
 *       500:
 *         description: Failed to create executive
 */
router.post(
  '/',
  createExecutiveController
);

/**
 * @swagger
 * /api/v1/executives/{id}:
 *   patch:
 *     summary: Update an executive
 *     tags: [Executives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Executive updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Executive not found
 *       500:
 *         description: Failed to update executive
 */
router.patch(
  '/:id',
  updateExecutiveController
);

/**
 * @swagger
 * /api/v1/executives/{id}:
 *   delete:
 *     summary: Soft delete an executive
 *     tags: [Executives]
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
 *         description: Executive deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Executive not found
 *       500:
 *         description: Failed to delete executive
 */
router.delete(
  '/:id',
  deleteExecutiveController
);

/**
 * @swagger
 * /api/v1/executives/{id}/branches:
 *   post:
 *     summary: Assign branches to an executive
 *     tags: [Executives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Executive UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branch_ids
 *             properties:
 *               branch_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example:
 *                   - "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *     responses:
 *       200:
 *         description: Branches assigned successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Executive not found
 *       500:
 *         description: Failed to assign branches
 */
router.post(
  '/:id/branches',
  assignBranchesController
);

/**
 * @swagger
 * /api/v1/executives/{id}/branches/{branchId}:
 *   delete:
 *     summary: Remove a branch assignment from an executive
 *     tags: [Executives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Executive UUID
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID to unassign
 *     responses:
 *       200:
 *         description: Branch unassigned successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Executive or branch assignment not found
 *       500:
 *         description: Failed to remove branch assignment
 */
router.delete(
  '/:id/branches/:branchId',
  removeBranchController
);

export default router;