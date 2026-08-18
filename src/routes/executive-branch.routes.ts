import { Router } from 'express';

import {
  assignExecutiveBranch,
  removeExecutiveBranch,
  getExecutiveBranch,
  getExecutivesByBranch,
} from '../controllers/executive-branch.controller';

const router = Router();

router.post(
  '/:executiveId/assign',
  assignExecutiveBranch
);

router.get(
  '/:executiveId',
  getExecutiveBranch
);

router.delete(
  '/:executiveId/:branchId',
  removeExecutiveBranch
);

router.get(
  '/branch/:branchId',
  getExecutivesByBranch
);

export default router;