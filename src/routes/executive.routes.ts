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
 * Executive Management
 */

router.get(
  '/',
  listExecutives
);

router.get(
  '/:id',
  getExecutive
);

router.post(
  '/',
  createExecutiveController
);

router.patch(
  '/:id',
  updateExecutiveController
);

router.delete(
  '/:id',
  deleteExecutiveController
);


/**
 * Executive ↔ Branch Assignment
 */

router.post(
  '/:id/branches',
  assignBranchesController
);

router.delete(
  '/:id/branches/:branchId',
  removeBranchController
);

export default router;