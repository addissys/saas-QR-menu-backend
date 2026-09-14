import { Router } from 'express';

import {
  assignExecutiveBranch,
  removeExecutiveBranch,
  getExecutiveBranch,
  getExecutivesByBranch,
} from '../controllers/executive-branch.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Executive Branches
 *   description: Assign and manage executive-branch relationships
 */

/**
 * @swagger
 * /api/v1/executive-branches/{executiveId}/assign:
 *   post:
 *     summary: Assign an executive to a branch
 *     tags: [Executive Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executiveId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The executive (staff) ID
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
 *                 description: The branch to assign the executive to
 *     responses:
 *       200:
 *         description: Executive assigned to branch successfully
 *       400:
 *         description: Invalid request data or executive ID
 */
router.post(
  '/:executiveId/assign',
  assignExecutiveBranch
);

/**
 * @swagger
 * /api/v1/executive-branches/{executiveId}:
 *   get:
 *     summary: Get branches assigned to an executive
 *     tags: [Executive Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executiveId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The executive (staff) ID
 *     responses:
 *       200:
 *         description: Executive branches retrieved successfully
 *       400:
 *         description: Invalid executive ID
 */
router.get(
  '/:executiveId',
  getExecutiveBranch
);

/**
 * @swagger
 * /api/v1/executive-branches/{executiveId}/{branchId}:
 *   delete:
 *     summary: Remove an executive from a branch
 *     tags: [Executive Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executiveId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The executive (staff) ID
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The branch ID to remove the executive from
 *     responses:
 *       200:
 *         description: Executive removed from branch successfully
 *       400:
 *         description: Invalid executive or branch ID
 */
router.delete(
  '/:executiveId/:branchId',
  removeExecutiveBranch
);

/**
 * @swagger
 * /api/v1/executive-branches/branch/{branchId}:
 *   get:
 *     summary: Get all executives assigned to a branch
 *     tags: [Executive Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The branch ID
 *     responses:
 *       200:
 *         description: Branch executives retrieved successfully
 *       400:
 *         description: Invalid branch ID
 */
router.get(
  '/branch/:branchId',
  getExecutivesByBranch
);

export default router;