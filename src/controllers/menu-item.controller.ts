import {
  Request,
  Response,
} from 'express';

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
    const branchId =
      typeof req.query.branch_id === 'string'
        ? req.query.branch_id
        : undefined;

    const categoryId =
      typeof req.query.category_id === 'string'
        ? req.query.category_id
        : undefined;

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : undefined;

    const menuItems =
      await getAllMenuItems(
        branchId,
        categoryId,
        search
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
      const validation =
        createMenuItemSchema.safeParse(
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