import { Request, Response } from 'express';

import {
  getPublicBranches,
  getBranchMenu,
  getTableMenu,
  searchPublicMenu,
} from '../services/public-menu.service';

/**
 * GET /public/branches
 */
export const getPublicBranchesController = async (
  req: Request,
  res: Response
) => {
  try {
    const branches = await getPublicBranches();

    return res.status(200).json({
      success: true,
      message: 'Public branches retrieved successfully',
      data: {
        branches,
      },
    });
  } catch (error) {
    console.error('Get public branches error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public branches',
    });
  }
};

/**
 * GET /public/branches/:branchId/menu
 */
export const getBranchMenuController = async (
  req: Request,
  res: Response
) => {
  try {
    const { branchId } = req.params;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required',
      });
    }

    const menu = await getBranchMenu(branchId);

    return res.status(200).json({
      success: true,
      message: 'Branch menu retrieved successfully',
      data: {
        menu,
      },
    });
  } catch (error: any) {
    console.error('Get branch menu error:', error);

    if (error.message === 'Branch not found or public menu is unavailable') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve branch menu',
    });
  }
};

/**
 * GET /public/branches/:branchId/tables/:tableId/menu
 */
export const getTableMenuController = async (
  req: Request,
  res: Response
) => {
  try {
    const { branchId, tableId } = req.params;

    if (!branchId || !tableId) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID and Table ID are required',
      });
    }

    const menu = await getTableMenu(branchId, tableId);

    return res.status(200).json({
      success: true,
      message: 'Table menu retrieved successfully',
      data: {
        menu,
      },
    });
  } catch (error: any) {
    console.error('Get table menu error:', error);

    if (
      error.message ===
      'Table not found or public menu is unavailable'
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve table menu',
    });
  }
};

/**
 * GET /public/search
 */
export const searchPublicMenuController = async (
  req: Request,
  res: Response
) => {
  try {
    const query = String(req.query.q || '').trim();

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const results = await searchPublicMenu(
      query,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: 'Public menu search completed successfully',
      data: {
        query,
        ...results,
      },
    });
  } catch (error) {
    console.error('Public menu search error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to search public menu',
    });
  }
};