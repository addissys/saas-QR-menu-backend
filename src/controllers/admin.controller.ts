import { Request, Response } from 'express';
import { getAdminDashboard } from '../services/admin.service';
import {
  adminSearchSchema,
} from '../validators/admin.validator';
import {
  searchPlatform,
} from '../services/admin.service';

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const dashboard = await getAdminDashboard();

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics retrieved successfully',
      data: dashboard,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard statistics',
    });
  }
};

export const searchAdminPlatform = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = adminSearchSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const {
      query,
      type,
      page,
      limit,
    } = validation.data;

    const results = await searchPlatform({
      query,
      type,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      data: {
        query,
        type,
        page,
        limit,
        results,
      },
    });
  } catch (error) {
    console.error('Admin search error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to search platform',
    });
  }
};