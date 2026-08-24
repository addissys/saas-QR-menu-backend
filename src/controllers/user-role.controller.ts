import { Request, Response } from 'express';

import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../services/user-role.service';

import {
  createRoleSchema,
  updateRoleSchema,
} from '../validators/user-role.validator';

/**
 * GET /user-roles
 */
export const getRoles = async (
  req: Request,
  res: Response
) => {
  try {
    const roles = await getAllRoles();

    return res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
    });
  } catch (error: any) {
    console.error('Get roles error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve roles',
    });
  }
};

/**
 * POST /user-roles
 */
export const createNewRole = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = createRoleSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const role = await createRole(validation.data);

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error: any) {
    console.error('Create role error:', error);

    if (error.message === 'Role already exists') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create role',
    });
  }
};

/**
 * PATCH /user-roles/:id
 */
export const updateExistingRole = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID',
      });
    }

    const validation = updateRoleSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const role = await updateRole(
      id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (error: any) {
    console.error('Update role error:', error);

    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    if (error.message === 'Role already exists') {
      return res.status(409).json({
        success: false,
        message: 'Role already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update role',
    });
  }
};

/**
 * DELETE /user-roles/:id
 */
export const removeRole = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID',
      });
    }

    await deleteRole(id);

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete role error:', error);

    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    if (
      error.message ===
      'Cannot delete role because it is assigned to users'
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete role',
    });
  }
};