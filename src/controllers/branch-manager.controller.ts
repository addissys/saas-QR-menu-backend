import { Request, Response } from 'express';

import {
  createBranchManagerSchema,
  updateBranchManagerSchema,
  assignBranchManagerSchema,
} from '../validators/branch-manager.validator';

import {
  getAllBranchManagers,
  getBranchManagerById,
  createBranchManager,
  updateBranchManager,
  deleteBranchManager,
  assignManagerToBranch,
  removeManagerFromBranch,
} from '../services/branch-manager.service';


export const listBranchManagers = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as any;
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

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : undefined;

    let tenantId =
      typeof req.query.tenant_id === 'string'
        ? req.query.tenant_id
        : undefined;

    if (!isSuperAdmin && authReq.user?.tenantId) {
      tenantId = authReq.user.tenantId;
    }

    const result =
      await getAllBranchManagers(
        page,
        limit,
        search,
        tenantId
      );

    return res.status(200).json({
      success: true,
      message:
        'Branch managers retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'List branch managers error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve branch managers',
    });
  }
};


export const getBranchManager = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message:
          'Invalid branch manager ID',
      });
    }

    const manager =
      await getBranchManagerById(id);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message:
          'Branch manager not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Branch manager retrieved successfully',
      data: {
        manager,
      },
    });
  } catch (error) {
    console.error(
      'Get branch manager error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve branch manager',
    });
  }
};


export const createBranchManagerController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const validation =
        createBranchManagerSchema.safeParse(
          req.body
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid request data',
          errors:
            validation.error.flatten(),
        });
      }

      const manager =
        await createBranchManager(
          validation.data.user_id
        );

      return res.status(201).json({
        success: true,
        message:
          'Branch manager created successfully',
        data: {
          manager,
        },
      });
    } catch (error: any) {
      console.error(
        'Create branch manager error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to create branch manager',
      });
    }
  };


export const updateBranchManagerController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id;

      if (typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message:
            'Invalid branch manager ID',
        });
      }

      const validation =
        updateBranchManagerSchema.safeParse(
          req.body
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid request data',
          errors:
            validation.error.flatten(),
        });
      }

      const manager =
        await updateBranchManager(
          id,
          validation.data
        );

      return res.status(200).json({
        success: true,
        message:
          'Branch manager updated successfully',
        data: {
          manager,
        },
      });
    } catch (error: any) {
      console.error(
        'Update branch manager error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to update branch manager',
      });
    }
  };


export const deleteBranchManagerController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id;

      if (typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message:
            'Invalid branch manager ID',
        });
      }

      await deleteBranchManager(id);

      return res.status(200).json({
        success: true,
        message:
          'Branch manager deleted successfully',
      });
    } catch (error: any) {
      console.error(
        'Delete branch manager error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to delete branch manager',
      });
    }
  };


export const assignManagerController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const managerId =
        req.params.managerId;

      if (typeof managerId !== 'string') {
        return res.status(400).json({
          success: false,
          message:
            'Invalid manager ID',
        });
      }

      const validation =
        assignBranchManagerSchema.safeParse(
          req.body
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid request data',
          errors:
            validation.error.flatten(),
        });
      }

      const branch =
        await assignManagerToBranch(
          managerId,
          validation.data.branch_id
        );

      return res.status(200).json({
        success: true,
        message:
          'Branch manager assigned successfully',
        data: {
          branch,
        },
      });
    } catch (error: any) {
      console.error(
        'Assign manager error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to assign branch manager',
      });
    }
  };


export const removeManagerController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const managerId =
        req.params.managerId;

      const branchId =
        req.params.branchId;

      if (
        typeof managerId !== 'string' ||
        typeof branchId !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid ID',
        });
      }

      await removeManagerFromBranch(
        managerId,
        branchId
      );

      return res.status(200).json({
        success: true,
        message:
          'Branch manager removed successfully',
      });
    } catch (error: any) {
      console.error(
        'Remove manager error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to remove branch manager',
      });
    }
  };