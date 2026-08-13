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

/**
 * GET /audit-logs
 */
export const listAuditLogs = async (
  req: Request,
  res: Response
) => {
  try {
    const queryResult =
      auditLogQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: queryResult.error.flatten(),
      });
    }

    const result = await getAuditLogs(
      queryResult.data
    );

    return res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: result,
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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Audit log ID is required',
      });
    }

    const auditLog =
      await getAuditLogById(id);

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
    const { id } = req.params;

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