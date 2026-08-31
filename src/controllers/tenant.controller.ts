import {
  Request,
  Response,
} from 'express';

import { AuthenticatedRequest } from '../middleware/auth.middleware';

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
    const authReq = req as AuthenticatedRequest;
    const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const search =
      req.query.search as
        | string
        | undefined;

    // Non-superadmins can only list their own tenant
    if (!isSuperAdmin) {
      const tenantId = authReq.user?.tenantId;
      if (!tenantId) {
        return res.status(200).json({
          success: true,
          message: 'No restaurant linked to this account',
          data: { tenants: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } },
        });
      }

      const tenant = await getTenantById(tenantId);
      if (!tenant) {
        return res.status(200).json({
          success: true,
          message: 'Restaurant not found',
          data: { tenants: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Tenant retrieved successfully',
        data: { tenants: [tenant], pagination: { page: 1, limit, total: 1, totalPages: 1 } },
      });
    }

    // Superadmins can see all tenants
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
    const authReq = req as AuthenticatedRequest;
    const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';
    const id = String(
      req.params.id
    );

    // Non-superadmins can only view their own tenant
    if (!isSuperAdmin && authReq.user?.tenantId !== id) {
      return res.status(403).json({
        success: false,
        message:
          'Not authorized to view this restaurant',
      });
    }

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
      const authReq = req as AuthenticatedRequest;
      const id = String(
        req.params.id
      );

      const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';

      // Non-superadmins can only update their own tenant
      if (!isSuperAdmin && authReq.user?.tenantId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this restaurant',
        });
      }

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
      const authReq = req as AuthenticatedRequest;
      const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';
      const id = String(
        req.params.id
      );

      // Non-superadmins can only delete their own tenant
      if (!isSuperAdmin && authReq.user?.tenantId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this restaurant',
        });
      }

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