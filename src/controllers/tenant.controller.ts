import {
  Request,
  Response,
} from 'express';

import {
  createTenantSchema,
  updateTenantSchema,
} from '../validators/tenant.validator';

import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
} from '../services/tenant.service';

export const listTenants = async (
  req: Request,
  res: Response
) => {
  try {
    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const search =
      req.query.search as
        | string
        | undefined;

    const result =
      await getAllTenants(
        page,
        limit,
        search
      );

    return res.status(200).json({
      success: true,
      message:
        'Tenants retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve tenants',
    });
  }
};

export const getTenant = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(
      req.params.id
    );

    const tenant =
      await getTenantById(id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message:
          'Tenant not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Tenant retrieved successfully',
      data: {
        tenant,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve tenant',
    });
  }
};

export const createTenantController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const validation =
        createTenantSchema.safeParse(
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

      const tenant =
        await createTenant(
          validation.data
        );

      return res.status(201).json({
        success: true,
        message:
          'Tenant created successfully',
        data: {
          tenant,
        },
      });
    } catch (error: any) {
      console.error(error);

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to create tenant',
      });
    }
  };

export const updateTenantController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = String(
        req.params.id
      );

      const validation =
        updateTenantSchema.safeParse(
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

      const tenant =
        await updateTenant(
          id,
          validation.data
        );

      return res.status(200).json({
        success: true,
        message:
          'Tenant updated successfully',
        data: {
          tenant,
        },
      });
    } catch (error: any) {
      console.error(error);

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to update tenant',
      });
    }
  };

export const removeTenant =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = String(
        req.params.id
      );

      await deleteTenant(id);

      return res.status(200).json({
        success: true,
        message:
          'Tenant deleted successfully',
      });
    } catch (error: any) {
      console.error(error);

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to delete tenant',
      });
    }
  };