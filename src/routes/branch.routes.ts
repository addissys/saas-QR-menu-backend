import { Router } from 'express';

import {
  listBranches,
  getBranch,
  createBranchController,
  updateBranchController,
  deleteBranch,
} from '../controllers/branch.controller';

const router = Router();

/**
 * Branch Management
 *
 * GET    /api/v1/branches
 * GET    /api/v1/branches/:id
 * POST   /api/v1/branches
 * PATCH  /api/v1/branches/:id
 * DELETE /api/v1/branches/:id
 */

router.get(
  '/',
  listBranches
);

router.get(
  '/:id',
  getBranch
);

router.post(
  '/',
  createBranchController
);

router.patch(
  '/:id',
  updateBranchController
);

router.delete(
  '/:id',
  deleteBranch
);

export default router;