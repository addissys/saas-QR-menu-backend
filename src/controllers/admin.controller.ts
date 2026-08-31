import { Request, Response } from 'express';
import { getAdminDashboard } from '../services/admin.service';
import {
  adminSearchSchema,
} from '../validators/admin.validator';
import {
  searchPlatform,
} from '../services/admin.service';


import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  softDeleteTenant,
} from '../services/admin.service';

import {
  createTenantSchema,
  updateTenantSchema,
} from '../validators/admin.validator';


// GET /admin/tenants

export const listTenants = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;

    const result = await getAllTenants(
      page,
      limit,
      search
    );

    return res.status(200).json({
      success: true,
      message: 'Restaurants retrieved successfully',
      data: result,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurants',
    });
  }
};


// GET /admin/tenants/:id

export const getTenant = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID' });
    }

    const tenant = await getTenantById(id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Restaurant retrieved successfully',
      data: {
        tenant,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant',
    });
  }
};


// POST /admin/tenants

export const createTenantController = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = createTenantSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.flatten(),
      });
    }

    const tenant = await createTenant(
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: {
        tenant,
      },
    });

  } catch (error: any) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create restaurant',
    });
  }
};


// PATCH /admin/tenants/:id

export const updateTenantController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID' });
    }

    const validation = updateTenantSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.flatten(),
      });
    }

    const tenant = await updateTenant(
      id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: {
        tenant,
      },
    });

  } catch (error: any) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update restaurant',
    });
  }
};


// DELETE /admin/tenants/:id

export const deleteTenant = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID' });
    }

    await softDeleteTenant(id);

    return res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully',
    });

  } catch (error: any) {
    console.error(error);

    return res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete restaurant',
    });
  }
};

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