import { Router } from 'express';

import {
  listTables,
  getTable,
  createTableController,
  updateTableController,
  deleteTableController,
} from '../controllers/table.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Restaurant table management
 */

/**
 * @swagger
 * /api/v1/tables:
 *   get:
 *     summary: List all tables
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tables by branch
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
 *         description: Tables listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch tables
 */
router.get(
  '/',
  listTables
);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   get:
 *     summary: Get a single table by ID
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     responses:
 *       200:
 *         description: Table retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Table not found
 *       500:
 *         description: Failed to fetch table
 */
router.get(
  '/:id',
  getTable
);

/**
 * @swagger
 * /api/v1/tables:
 *   post:
 *     summary: Create a new table
 *     tags: [Tables]
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
 *               - table_number
 *             properties:
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               table_number:
 *                 type: string
 *                 example: "T-01"
 *               capacity:
 *                 type: integer
 *                 example: 4
 *               description:
 *                 type: string
 *                 example: Window seat by the garden
 *     responses:
 *       201:
 *         description: Table created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Table number already exists in this branch
 *       500:
 *         description: Failed to create table
 */
router.post(
  '/',
  createTableController
);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   patch:
 *     summary: Update a table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_number:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Table not found
 *       500:
 *         description: Failed to update table
 */
router.patch(
  '/:id',
  updateTableController
);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   delete:
 *     summary: Soft delete a table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Table UUID
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Table not found
 *       500:
 *         description: Failed to delete table
 */
router.delete(
  '/:id',
  deleteTableController
);

export default router;