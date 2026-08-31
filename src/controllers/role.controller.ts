import { Request, Response } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../services/user-role.service';

/**
 * GET /api/v1/roles
 */
export const listRoles = async (req: Request, res: Response) => {
  try {
    const roles = await getAllRoles();

    return res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
    });
  } catch (error: any) {
    console.error('List roles error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve roles',
    });
  }
};

/**
 * GET /api/v1/roles/:id
 */
export const getRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID',
      });
    }

    const role = await getRoleById(id);

    return res.status(200).json({
      success: true,
      message: 'Role retrieved successfully',
      data: role,
    });
  } catch (error: any) {
    console.error('Get role error:', error);
    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve role',
    });
  }
};

/**
 * POST /api/v1/roles
 */
export const createRoleController = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required',
      });
    }

    const role = await createRole({ name, description });

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
      message: error.message || 'Failed to create role',
    });
  }
};

/**
 * PATCH /api/v1/roles/:id
 */
export const updateRoleController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID',
      });
    }

    const role = await updateRole(id, { name, description });

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
        message: error.message,
      });
    }
    if (error.message === 'Role already exists') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update role',
    });
  }
};

/**
 * DELETE /api/v1/roles/:id
 */
export const deleteRoleController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
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
        message: error.message,
      });
    }
    if (error.message && error.message.includes('assigned to users')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete role',
    });
  }
};
