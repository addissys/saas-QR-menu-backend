import { Router } from 'express';

import {
  listTables,
  getTable,
  createTableController,
  updateTableController,
  deleteTableController,
} from '../controllers/table.controller';

const router = Router();

router.get(
  '/',
  listTables
);

router.get(
  '/:id',
  getTable
);

router.post(
  '/',
  createTableController
);

router.patch(
  '/:id',
  updateTableController
);

router.delete(
  '/:id',
  deleteTableController
);

export default router;