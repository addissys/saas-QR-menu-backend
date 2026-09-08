import {
  Request,
  Response,
} from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { assertBranchAccess, getScopedBranchIds, findBranchForResource } from '../middleware/branch-scope.middleware';

import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator';

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/category.service';

export const listCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';

    const branchId =
      typeof req.query.branch_id === 'string'
        ? req.query.branch_id
        : undefined;

    let tenantId =
      typeof req.query.tenant_id === 'string'
        ? req.query.tenant_id
        : undefined;

    if (!isSuperAdmin && authReq.user?.tenantId) {
      tenantId = authReq.user.tenantId;
    }

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : undefined;

    const categories =
      await getAllCategories(
        branchId,
        search,
        tenantId,
        getScopedBranchIds(req)
      );

    return res.status(200).json({
      success: true,
      message:
        'Categories retrieved successfully',
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error(
      'List categories error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve categories',
    });
  }
};

export const getCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
      });
    }

    const resourceBranchId = await findBranchForResource('category', id);
    if (resourceBranchId) await assertBranchAccess(req, resourceBranchId);
    const category =
      await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Category retrieved successfully',
      data: {
        category,
      },
    });
  } catch (error) {
    console.error(
      'Get category error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve category',
    });
  }
};

export const createCategoryController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const validation =
        createCategorySchema.safeParse(
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

      const category =
        await createCategory(
          validation.data
        );

      return res.status(201).json({
        success: true,
        message:
          'Category created successfully',
        data: {
          category,
        },
      });
    } catch (error: any) {
      console.error(
        'Create category error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to create category',
      });
    }
  };

export const updateCategoryController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const branchId = await findBranchForResource('category', req.params.id as string);
      if (branchId) await assertBranchAccess(req, branchId);
      const id = req.params.id;

      if (typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      const validation =
        updateCategorySchema.safeParse(
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

      const category =
        await updateCategory(
          id,
          validation.data
        );

      return res.status(200).json({
        success: true,
        message:
          'Category updated successfully',
        data: {
          category,
        },
      });
    } catch (error: any) {
      console.error(
        'Update category error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to update category',
      });
    }
  };

export const deleteCategoryController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const branchId = await findBranchForResource('category', req.params.id as string);
      if (branchId) await assertBranchAccess(req, branchId);
      const id = req.params.id;

      if (typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      await deleteCategory(id);

      return res.status(200).json({
        success: true,
        message:
          'Category deleted successfully',
      });
    } catch (error: any) {
      console.error(
        'Delete category error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to delete category',
      });
    }
  };