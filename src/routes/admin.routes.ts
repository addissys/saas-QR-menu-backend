import { Router } from 'express';
import { getDashboard } from '../controllers/admin.controller';
import {
  searchAdminPlatform,
} from '../controllers/admin.controller';

const router = Router();

router.get('/dashboard', getDashboard);
/*
 * Admin platform search
 *
 * GET /api/v1/admin/search
 */
router.get('/search', searchAdminPlatform);

export default router;