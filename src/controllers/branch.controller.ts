import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getScopedBranchIds, assertBranchAccess } from '../middleware/branch-scope.middleware';

import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  softDeleteBranch,
} from '../services/branch.service';

import {
  createBranchSchema,
  updateBranchSchema,
} from '../validators/branch.validator';

export const listBranches = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    let tenant_id =
      typeof req.query.tenant_id === 'string'
        ? req.query.tenant_id
        : undefined;

    // Strict Tenant Isolation: Auto-scope non-superadmin users to their own restaurant
    if (!isSuperAdmin && authReq.user?.tenantId) {
      tenant_id = authReq.user.tenantId;
    }

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : undefined;

    // Optional status filter (ACTIVE, INACTIVE, MAINTENANCE)
    const status =
      typeof req.query.status === 'string' &&
      ['ACTIVE', 'INACTIVE', 'MAINTENANCE'].includes(req.query.status.toUpperCase())
        ? (req.query.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE')
        : undefined;

    const userRole = authReq.user?.roleName?.toUpperCase() || '';
    const isOwnerOrAdmin = ['SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER'].includes(userRole);

    const branch_ids = !isOwnerOrAdmin ? (getScopedBranchIds(req) ?? []) : undefined;

    const result = await getAllBranches({
      page,
      limit,
      tenant_id,
      search,
      status,
      branch_ids,
    });

    return res.status(200).json({
      success: true,
      message: 'Branches retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'List branches error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve branches',
    });
  }
};

export const getBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID',
      });
    }

    const scopedBranchIds = getScopedBranchIds(req);
    if (scopedBranchIds && !scopedBranchIds.includes(id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this branch.' });
    }
    const branch = await getBranchById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Branch retrieved successfully',
      data: {
        branch,
      },
    });
  } catch (error) {
    console.error(
      'Get branch error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve branch',
    });
  }
};

export const createBranchController = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';

    const validation =
      createBranchSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors:
          validation.error.flatten(),
      });
    }

    // Tenant isolation verification: Cannot create branch for another tenant
    if (!isSuperAdmin && authReq.user?.tenantId && validation.data.tenant_id !== authReq.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Cannot create branch for another restaurant organization',
      });
    }

    const branch = await createBranch(
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: {
        branch,
      },
    });
  } catch (error: any) {
    console.error(
      'Create branch error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to create branch',
    });
  }
};

export const updateBranchController = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.roleName?.toUpperCase() === 'BRANCH_MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Branch Managers have read-only access to branch details and cannot modify branch information.',
      });
    }
    if (typeof req.params.id === 'string') await assertBranchAccess(req, req.params.id);
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID',
      });
    }

    const validation =
      updateBranchSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors:
          validation.error.flatten(),
      });
    }

    const branch = await updateBranch(
      id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      data: {
        branch,
      },
    });
  } catch (error: any) {
    console.error(
      'Update branch error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to update branch',
    });
  }
};

export const deleteBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.roleName?.toUpperCase() === 'BRANCH_MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Branch Managers have read-only access to branch details and cannot delete branch information.',
      });
    }
    if (typeof req.params.id === 'string') await assertBranchAccess(req, req.params.id);
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID',
      });
    }

    await softDeleteBranch(id);

    return res.status(200).json({
      success: true,
      message: 'Branch deleted successfully',
    });
  } catch (error: any) {
    console.error(
      'Delete branch error:',
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        'Failed to delete branch',
    });
  }
};