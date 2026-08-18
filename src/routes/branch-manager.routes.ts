import { Router } from 'express';

import {
  listBranchManagers,
  getBranchManager,
  createBranchManagerController,
  updateBranchManagerController,
  deleteBranchManagerController,
  assignManagerController,
  removeManagerController,
} from '../controllers/branch-manager.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Branch Managers
 *   description: Branch manager staff management and branch assignments
 */

/**
 * @swagger
 * /api/v1/branch-managers:
 *   get:
 *     summary: List all branch managers
 *     tags: [Branch Managers]
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
 *         name: branch_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assigned branch
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
 *         description: Branch managers listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch branch managers
 */
router.get(
  '/',
  listBranchManagers
);

/**
 * @swagger
 * /api/v1/branch-managers/{id}:
 *   get:
 *     summary: Get a single branch manager by ID
 *     tags: [Branch Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch manager UUID
 *     responses:
 *       200:
 *         description: Branch manager retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Branch manager not found
 *       500:
 *         description: Failed to fetch branch manager
 */
router.get(
  '/:id',
  getBranchManager
);

/**
 * @swagger
 * /api/v1/branch-managers:
 *   post:
 *     summary: Create a new branch manager
 *     tags: [Branch Managers]
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
 *     responses:
 *       201:
 *         description: Branch manager created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       409:
 *         description: User is already a branch manager
 *       500:
 *         description: Failed to create branch manager
 */
router.post(
  '/',
  createBranchManagerController
);

/**
 * @swagger
 * /api/v1/branch-managers/{id}:
 *   patch:
 *     summary: Update a branch manager
 *     tags: [Branch Managers]
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Branch manager updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Branch manager not found
 *       500:
 *         description: Failed to update branch manager
 */
router.patch(
  '/:id',
  updateBranchManagerController
);

/**
 * @swagger
 * /api/v1/branch-managers/{id}:
 *   delete:
 *     summary: Soft delete a branch manager
 *     tags: [Branch Managers]
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
 *         description: Branch manager deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Branch manager not found
 *       500:
 *         description: Failed to delete branch manager
 */
router.delete(
  '/:id',
  deleteBranchManagerController
);

/**
 * @swagger
 * /api/v1/branch-managers/{managerId}/assign:
 *   post:
 *     summary: Assign a branch to a manager
 *     tags: [Branch Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch manager UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branch_id
 *             properties:
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     responses:
 *       200:
 *         description: Branch assigned to manager successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Branch manager or branch not found
 *       409:
 *         description: Manager already assigned to this branch
 *       500:
 *         description: Failed to assign branch
 */
router.post(
  '/:managerId/assign',
  assignManagerController
);

/**
 * @swagger
 * /api/v1/branch-managers/{managerId}/branches/{branchId}:
 *   delete:
 *     summary: Remove a branch assignment from a manager
 *     tags: [Branch Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch manager UUID
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch UUID to unassign
 *     responses:
 *       200:
 *         description: Branch unassigned from manager successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Failed to remove branch assignment
 */
router.delete(
  '/:managerId/branches/:branchId',
  removeManagerController
);

export default router;