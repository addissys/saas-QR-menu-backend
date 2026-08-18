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

// Branch manager management

router.get(
  '/',
  listBranchManagers
);

router.get(
  '/:id',
  getBranchManager
);

router.post(
  '/',
  createBranchManagerController
);

router.patch(
  '/:id',
  updateBranchManagerController
);

router.delete(
  '/:id',
  deleteBranchManagerController
);

// Manager ↔ Branch

router.post(
  '/:managerId/assign',
  assignManagerController
);

router.delete(
  '/:managerId/branches/:branchId',
  removeManagerController
);

export default router;