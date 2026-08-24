import { Router } from 'express';

import {
  listTenants,
  getTenant,
  createTenantController,
  updateTenantController,
  removeTenant,
} from '../controllers/tenant.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: SaaS tenant (restaurant) management
 */

/**
 * @swagger
 * /api/v1/tenants:
 *   get:
 *     summary: List all tenants (restaurants)
 *     tags: [Tenants]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, TRIAL, ACTIVE, SUSPENDED, INACTIVE]
 *         description: Filter by tenant status
 *     responses:
 *       200:
 *         description: Tenants listed successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch tenants
 */
router.get(
  '/',
  listTenants
);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   get:
 *     summary: Get a single tenant (restaurant) by ID
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant UUID
 *     responses:
 *       200:
 *         description: Tenant retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Failed to fetch tenant
 */
router.get(
  '/:id',
  getTenant
);

/**
 * @swagger
 * /api/v1/tenants:
 *   post:
 *     summary: Register a new restaurant (tenant)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner_id
 *               - business_name
 *               - business_slug
 *               - email
 *               - address
 *               - city
 *               - country
 *             properties:
 *               owner_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               business_name:
 *                 type: string
 *                 example: Addis Coffee House
 *               business_slug:
 *                 type: string
 *                 example: addis-coffee-house
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@addiscoffee.com
 *               phone:
 *                 type: string
 *                 example: "+251911000000"
 *               address:
 *                 type: string
 *                 example: Bole Road, Addis Ababa
 *               city:
 *                 type: string
 *                 example: Addis Ababa
 *               country:
 *                 type: string
 *                 example: Ethiopia
 *               logo_url:
 *                 type: string
 *                 example: https://example.com/logo.png
 *               brand_color:
 *                 type: string
 *                 example: "#FF6B35"
 *     responses:
 *       201:
 *         description: Tenant registered successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Slug or email already taken
 *       500:
 *         description: Failed to create tenant
 */
router.post(
  '/',
  createTenantController
);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   patch:
 *     summary: Update a restaurant (tenant)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               brand_color:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, TRIAL, ACTIVE, SUSPENDED, INACTIVE]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Failed to update tenant
 */
router.patch(
  '/:id',
  updateTenantController
);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   delete:
 *     summary: Soft delete a restaurant (tenant)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant UUID
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Failed to delete tenant
 */
router.delete(
  '/:id',
  removeTenant
);

export default router;