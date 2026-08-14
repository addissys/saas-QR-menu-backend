import { Router } from 'express';
import { getDashboard } from '../controllers/admin.controller';
import {
  searchAdminPlatform,
} from '../controllers/admin.controller';

import {
  listTenants,
  getTenant,
  createTenantController,
  updateTenantController,
  deleteTenant,
} from '../controllers/admin.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and tenant management
 */

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       500:
 *         description: Failed to load dashboard
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /api/v1/admin/search:
 *   get:
 *     summary: Search across the admin platform (tenants, users, etc.)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results returned
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Search failed
 */
router.get('/search', searchAdminPlatform);

// ================================
// Tenant Management
// ================================

/**
 * @swagger
 * /api/v1/admin/tenants:
 *   get:
 *     summary: List all tenants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, TRIAL, ACTIVE, SUSPENDED, INACTIVE]
 *     responses:
 *       200:
 *         description: Tenants listed successfully
 *       500:
 *         description: Failed to fetch tenants
 */
router.get(
  '/tenants',
  listTenants
);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}:
 *   get:
 *     summary: Get a single tenant by ID
 *     tags: [Admin]
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
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Failed to fetch tenant
 */
router.get(
  '/tenants/:id',
  getTenant
);

/**
 * @swagger
 * /api/v1/admin/tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Admin]
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
 *               business_name:
 *                 type: string
 *                 example: My Cafe
 *               business_slug:
 *                 type: string
 *                 example: my-cafe
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
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Slug or email already taken
 *       500:
 *         description: Failed to create tenant
 */
router.post(
  '/tenants',
  createTenantController
);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}:
 *   patch:
 *     summary: Update a tenant
 *     tags: [Admin]
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
 *               business_name:
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
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Failed to update tenant
 */
router.patch(
  '/tenants/:id',
  updateTenantController
);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}:
 *   delete:
 *     summary: Soft delete a tenant
 *     tags: [Admin]
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
 *         description: Tenant deleted successfully
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Failed to delete tenant
 */
router.delete(
  '/tenants/:id',
  deleteTenant
);


export default router;