import { Request, Response } from 'express';

import {
  assignExecutiveBranchSchema,
} from '../validators/executive-branch.validator';

import {
  assignExecutiveToBranch,
  removeExecutiveFromBranch,
  getExecutiveBranches,
  getBranchExecutives,
} from '../services/executive-branch.service';

/**
 * Assign executive to branch
 */
export const assignExecutiveBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const executiveId = req.params.executiveId;

    if (typeof executiveId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid executive ID',
      });
    }

    const validation =
      assignExecutiveBranchSchema.safeParse(
        req.body
      );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors:
          validation.error.flatten(),
      });
    }

    const executive =
      await assignExecutiveToBranch(
        executiveId,
        validation.data.branch_id
      );

    return res.status(200).json({
      success: true,
      message:
        'Executive assigned to branch successfully',
      data: {
        executive,
      },
    });
  } catch (error: any) {
    console.error(
      'Assign executive branch error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to assign executive to branch',
    });
  }
};

/**
 * Remove executive from branch
 */
export const removeExecutiveBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const executiveId = req.params.executiveId;

    if (typeof executiveId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid executive ID',
      });
    }

    const executive =
      await removeExecutiveFromBranch(
        executiveId
      );

    return res.status(200).json({
      success: true,
      message:
        'Executive removed from branch successfully',
      data: {
        executive,
      },
    });
  } catch (error: any) {
    console.error(
      'Remove executive branch error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to remove executive from branch',
    });
  }
};

/**
 * Get executive branch
 */
export const getExecutiveBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const executiveId =
      req.params.executiveId;

    if (typeof executiveId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid executive ID',
      });
    }

    const branch =
      await getExecutiveBranches(
        executiveId
      );

    return res.status(200).json({
      success: true,
      message:
        'Executive branch retrieved successfully',
      data: {
        branch,
      },
    });
  } catch (error: any) {
    console.error(
      'Get executive branch error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to retrieve executive branch',
    });
  }
};

/**
 * Get executives assigned to branch
 */
export const getExecutivesByBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const branchId = req.params.branchId;

    if (typeof branchId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID',
      });
    }

    const executives =
      await getBranchExecutives(
        branchId
      );

    return res.status(200).json({
      success: true,
      message:
        'Branch executives retrieved successfully',
      data: {
        executives,
      },
    });
  } catch (error: any) {
    console.error(
      'Get branch executives error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to retrieve branch executives',
    });
  }
};