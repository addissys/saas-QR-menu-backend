import { Router } from 'express';

import {
  listCategories,
  getCategory,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/category.controller';

const router = Router();

router.get(
  '/',
  listCategories
);

router.get(
  '/:id',
  getCategory
);

router.post(
  '/',
  createCategoryController
);

router.patch(
  '/:id',
  updateCategoryController
);

router.delete(
  '/:id',
  deleteCategoryController
);

export default router;