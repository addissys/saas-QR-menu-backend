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

router.get('/dashboard', getDashboard);
/*
 * Admin platform search
 *
 * GET /api/v1/admin/search
 */
router.get('/search', searchAdminPlatform);

// ================================
// Tenant Management
// ================================

router.get(
  '/tenants',
  listTenants
);

router.get(
  '/tenants/:id',
  getTenant
);

router.post(
  '/tenants',
  createTenantController
);

router.patch(
  '/tenants/:id',
  updateTenantController
);

router.delete(
  '/tenants/:id',
  deleteTenant
);


export default router;