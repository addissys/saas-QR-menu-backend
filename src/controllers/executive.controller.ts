import {
  Request,
  Response,
} from 'express';

import {
  createExecutiveSchema,
  updateExecutiveSchema,
  assignExecutiveBranchesSchema,
} from '../validators/executive.validator';

import {
  getAllExecutives,
  getExecutiveById,
  createExecutive,
  updateExecutive,
  deleteExecutive,
  assignExecutiveBranches,
  removeExecutiveFromBranch,
} from '../services/executive.service';


export const listExecutives = async (
  req: Request,
  res: Response
) => {
  try {
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

    const result =
      await getAllExecutives(
        page,
        limit,
        search
      );

    return res.status(200).json({
      success: true,
      message:
        'Executives retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'List executives error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve executives',
    });
  }
};


export const getExecutive = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid executive ID',
      });
    }

    const executive =
      await getExecutiveById(id);

    if (!executive) {
      return res.status(404).json({
        success: false,
        message: 'Executive not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Executive retrieved successfully',
      data: {
        executive,
      },
    });
  } catch (error) {
    console.error(
      'Get executive error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve executive',
    });
  }
};


export const createExecutiveController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const validation =
        createExecutiveSchema.safeParse(
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

      const executive =
        await createExecutive(
          validation.data
        );

      return res.status(201).json({
        success: true,
        message:
          'Executive created successfully',
        data: {
          executive,
        },
      });
    } catch (error: any) {
      console.error(
        'Create executive error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to create executive',
      });
    }
  };


export const updateExecutiveController =
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
            'Invalid executive ID',
        });
      }

      const validation =
        updateExecutiveSchema.safeParse(
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

      const executive =
        await updateExecutive(
          id,
          validation.data
        );

      return res.status(200).json({
        success: true,
        message:
          'Executive updated successfully',
        data: {
          executive,
        },
      });
    } catch (error: any) {
      console.error(
        'Update executive error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to update executive',
      });
    }
  };


export const deleteExecutiveController =
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
            'Invalid executive ID',
        });
      }

      await deleteExecutive(id);

      return res.status(200).json({
        success: true,
        message:
          'Executive deleted successfully',
      });
    } catch (error: any) {
      console.error(
        'Delete executive error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to delete executive',
      });
    }
  };


export const assignBranchesController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const executiveId =
        req.params.id;

      if (
        typeof executiveId !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid executive ID',
        });
      }

      const validation =
        assignExecutiveBranchesSchema.safeParse(
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

      const executive =
        await assignExecutiveBranches(
          executiveId,
          validation.data.branch_ids
        );

      return res.status(200).json({
        success: true,
        message:
          'Branches assigned to executive successfully',
        data: {
          executive,
        },
      });
    } catch (error: any) {
      console.error(
        'Assign branches error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to assign branches',
      });
    }
  };


export const removeBranchController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const executiveId =
        req.params.id;

      const branchId =
        req.params.branchId;

      if (
        typeof executiveId !== 'string' ||
        typeof branchId !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid ID',
        });
      }

      await removeExecutiveFromBranch(
        executiveId,
        branchId
      );

      return res.status(200).json({
        success: true,
        message:
          'Executive removed from branch successfully',
      });
    } catch (error: any) {
      console.error(
        'Remove branch error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to remove executive from branch',
      });
    }
  };