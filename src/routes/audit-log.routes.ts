import { Router } from 'express';

import {
  listAuditLogs,
  getAuditLog,
  createAuditLogController,
  deleteAuditLog,
} from '../controllers/audit-log.controller';

const router = Router();

/*
 * Audit Logs
 *
 * Authentication/authorization middleware
 * can be added here.
 */

// List audit logs
router.get(
  '/',
  listAuditLogs
);

// Get one audit log
router.get(
  '/:id',
  getAuditLog
);

// Create audit log
router.post(
  '/',
  createAuditLogController
);

// Soft delete audit log
router.delete(
  '/:id',
  deleteAuditLog
);

export default router;