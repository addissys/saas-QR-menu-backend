import { Router } from 'express';

import {
  listTenants,
  getTenant,
  createTenantController,
  updateTenantController,
  removeTenant,
} from '../controllers/tenant.controller';

const router = Router();

router.get(
  '/',
  listTenants
);

router.get(
  '/:id',
  getTenant
);

router.post(
  '/',
  createTenantController
);

router.patch(
  '/:id',
  updateTenantController
);

router.delete(
  '/:id',
  removeTenant
);

export default router;