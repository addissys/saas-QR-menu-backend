import {
  Request,
  Response,
} from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { assertBranchAccess, getScopedBranchIds, findBranchForResource } from '../middleware/branch-scope.middleware';

import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from '../validators/menu-item.validator';

import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../services/menu-item.service';

export const listMenuItems = async (
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

    const categoryId =
      typeof req.query.category_id === 'string'
        ? req.query.category_id
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

    const menuItems =
      await getAllMenuItems(
        branchId,
        categoryId,
        search,
        tenantId,
        getScopedBranchIds(req)
      );

    return res.status(200).json({
      success: true,
      message:
        'Menu items retrieved successfully',
      data: {
        menuItems,
      },
    });
  } catch (error) {
    console.error(
      'List menu items error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve menu items',
    });
  }
};

export const getMenuItem = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID',
      });
    }

    const resourceBranchId = await findBranchForResource('menuItem', id);
    if (resourceBranchId) await assertBranchAccess(req, resourceBranchId);
    const menuItem =
      await getMenuItemById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message:
          'Menu item not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Menu item retrieved successfully',
      data: {
        menuItem,
      },
    });
  } catch (error) {
    console.error(
      'Get menu item error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve menu item',
    });
  }
};

export const createMenuItemController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const branchId = await findBranchForResource('menuItem', req.params.id as string);
      if (branchId) await assertBranchAccess(req, branchId);
      const authReq = req as AuthenticatedRequest;

      if (!req.body.branch_id && req.body.category_id) {
        const category = await prisma.category.findUnique({
          where: { id: req.body.category_id },
          select: { branch_id: true },
        });
        if (category) {
          req.body.branch_id = category.branch_id;
        }
      }

      if (!req.body.branch_id && authReq.user?.tenantId) {
        const branch = await prisma.branch.findFirst({
          where: { tenant_id: authReq.user.tenantId, deleted_at: null },
          select: { id: true },
        });
        if (branch) {
          req.body.branch_id = branch.id;
        }
      }

      const validation =
        createMenuItemSchema.safeParse(
          req.body
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validation.error.flatten(),
        });
      }

      const menuItem =
        await createMenuItem(
          validation.data
        );

      return res.status(201).json({
        success: true,
        message:
          'Menu item created successfully',
        data: {
          menuItem,
        },
      });
    } catch (error: any) {
      console.error(
        'Create menu item error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to create menu item',
      });
    }
  };

export const updateMenuItemController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const branchId = await findBranchForResource('menuItem', req.params.id as string);
      if (branchId) await assertBranchAccess(req, branchId);
      const id = req.params.id;

      if (typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message:
            'Invalid menu item ID',
        });
      }

      const validation =
        updateMenuItemSchema.safeParse(
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

      const menuItem =
        await updateMenuItem(
          id,
          validation.data
        );

      return res.status(200).json({
        success: true,
        message:
          'Menu item updated successfully',
        data: {
          menuItem,
        },
      });
    } catch (error: any) {
      console.error(
        'Update menu item error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to update menu item',
      });
    }
  };

export const deleteMenuItemController =
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
            'Invalid menu item ID',
        });
      }

      await deleteMenuItem(id);

      return res.status(200).json({
        success: true,
        message:
          'Menu item deleted successfully',
      });
    } catch (error: any) {
      console.error(
        'Delete menu item error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to delete menu item',
      });
    }
  };

export const updateMenuItemAvailabilityController = async (
  req: Request,
  res: Response
) => {
  try {
    const branchId = await findBranchForResource('menuItem', req.params.id as string);
    if (branchId) await assertBranchAccess(req, branchId);
    const id = req.params.id as string;
    const { is_available } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID',
      });
    }

    if (typeof is_available !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_available boolean is required',
      });
    }

    const menuItem = await updateMenuItem(id, { is_available });

    return res.status(200).json({
      success: true,
      message: 'Menu item availability updated successfully',
      data: {
        menuItem,
      },
    });
  } catch (error: any) {
    console.error('Update menu item availability error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update menu item availability',
    });
  }
};

export const updateMenuItemFeaturedController = async (
  req: Request,
  res: Response
) => {
  try {
    const branchId = await findBranchForResource('menuItem', req.params.id as string);
    if (branchId) await assertBranchAccess(req, branchId);
    const id = req.params.id as string;
    const { is_featured } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID',
      });
    }

    if (typeof is_featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_featured boolean is required',
      });
    }

    const menuItem = await updateMenuItem(id, { is_featured });

    return res.status(200).json({
      success: true,
      message: 'Menu item featured status updated successfully',
      data: {
        menuItem,
      },
    });
  } catch (error: any) {
    console.error('Update menu item featured error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update menu item featured status',
    });
  }
};