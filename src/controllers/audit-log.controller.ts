import { Request, Response } from 'express';

import {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  softDeleteAuditLog,
} from '../services/audit-log.service';

import {
  createAuditLogSchema,
  auditLogQuerySchema,
} from '../validators/audit-log.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const OWNER_ROLES = new Set([
  'OWNER',
  'CAFE_OWNER',
  'RESTAURANT_OWNER',
]);

const getAuditLogTenantScope = (
  req: AuthenticatedRequest
) => {
  const roleName = req.user?.roleName?.toUpperCase();

  if (roleName === 'SUPER_ADMIN') {
    return { isSuperAdmin: true, tenantId: undefined };
  }

  if (!OWNER_ROLES.has(roleName || '')) {
    return { isSuperAdmin: false, tenantId: undefined };
  }

  return {
    isSuperAdmin: false,
    tenantId: req.user?.tenantId,
  };
};

/**
 * GET /audit-logs
 */
export const listAuditLogs = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { isSuperAdmin, tenantId } =
      getAuditLogTenantScope(authReq);

    if (!isSuperAdmin && !tenantId) {
      return res.status(403).json({
        success: false,
        message: 'A tenant is required to access audit logs',
      });
    }

    const queryResult =
      auditLogQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: queryResult.error.flatten(),
      });
    }

    const queryData = {
      ...queryResult.data,
      ...(isSuperAdmin ? {} : { tenant_id: tenantId }),
    };

    const result = await getAuditLogs(
      queryData
    );

    return res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: {
        auditLogs: result.auditLogs,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error('List audit logs error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs',
    });
  }
};

/**
 * GET /audit-logs/:id
 */
export const getAuditLog = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { isSuperAdmin, tenantId } =
      getAuditLogTenantScope(authReq);

    if (!isSuperAdmin && !tenantId) {
      return res.status(403).json({
        success: false,
        message: 'A tenant is required to access audit logs',
      });
    }

    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Audit log ID is required',
      });
    }

    const auditLog =
      await getAuditLogById(
        id,
        isSuperAdmin ? undefined : tenantId
      );

    return res.status(200).json({
      success: true,
      message: 'Audit log retrieved successfully',
      data: {
        auditLog,
      },
    });
  } catch (error: any) {
    console.error('Get audit log error:', error);

    if (
      error.message === 'Audit log not found'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit log',
    });
  }
};

/**
 * POST /audit-logs
 */
export const createAuditLogController = async (
  req: Request,
  res: Response
) => {
  try {
    const validation =
      createAuditLogSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid audit log data',
        errors: validation.error.flatten(),
      });
    }

    const auditLog =
      await createAuditLog(validation.data);

    return res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: {
        auditLog,
      },
    });
  } catch (error) {
    console.error(
      'Create audit log error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create audit log',
    });
  }
};

/**
 * DELETE /audit-logs/:id
 *
 * Soft delete only.
 *
 * Super Admin access should be enforced
 * by role middleware.
 */
export const deleteAuditLog = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Audit log ID is required',
      });
    }

    const auditLog =
      await softDeleteAuditLog(id);

    return res.status(200).json({
      success: true,
      message: 'Audit log deleted successfully',
      data: {
        auditLog,
      },
    });
  } catch (error: any) {
    console.error(
      'Delete audit log error:',
      error
    );

    if (
      error.message === 'Audit log not found'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete audit log',
    });
  }
};