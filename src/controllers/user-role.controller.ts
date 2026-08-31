import { Request, Response } from 'express';

import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getUserRoleAssignments,
  assignRoleToUser,
  updateUserRoleAssignment,
  revokeUserRoleAssignment,
} from '../services/user-role.service';

import {
  createRoleSchema,
  updateRoleSchema,
} from '../validators/user-role.validator';

/**
 * GET /user-roles (List user role assignments)
 */
export const listUserRoleAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await getUserRoleAssignments();

    return res.status(200).json({
      success: true,
      message: 'User role assignments retrieved successfully',
      data: assignments,
    });
  } catch (error: any) {
    console.error('Get user role assignments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user role assignments',
    });
  }
};

/**
 * POST /user-roles (Assign role to user)
 */
export const assignUserRoleController = async (req: Request, res: Response) => {
  try {
    const { user_id, role_id } = req.body;

    if (!user_id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id and role_id are required',
      });
    }

    const assignment = await assignRoleToUser({ user_id, role_id });

    return res.status(201).json({
      success: true,
      message: 'Role assigned to user successfully',
      data: assignment,
    });
  } catch (error: any) {
    console.error('Assign user role error:', error);
    if (error.message === 'User not found' || error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to assign role to user',
    });
  }
};

/**
 * PATCH /user-roles/:id (Update role assignment for user)
 */
export const updateUserRoleAssignmentController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { role_id } = req.body;

    if (!id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role_id are required',
      });
    }

    const assignment = await updateUserRoleAssignment(id, role_id);

    return res.status(200).json({
      success: true,
      message: 'User role assignment updated successfully',
      data: assignment,
    });
  } catch (error: any) {
    console.error('Update user role assignment error:', error);
    if (error.message === 'User not found' || error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update user role assignment',
    });
  }
};

/**
 * DELETE /user-roles/:id (Revoke role assignment)
 */
export const revokeUserRoleAssignmentController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const result = await revokeUserRoleAssignment(id);

    return res.status(200).json({
      success: true,
      message: 'User role assignment revoked successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Revoke user role assignment error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to revoke user role assignment',
    });
  }
};

/**
 * Backward compatibility exports for role CRUD
 */
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await getAllRoles();
    return res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve roles' });
  }
};

export const createNewRole = async (req: Request, res: Response) => {
  try {
    const validation = createRoleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.error.issues });
    }
    const role = await createRole(validation.data);
    return res.status(201).json({ success: true, message: 'Role created successfully', data: role });
  } catch (error: any) {
    if (error.message === 'Role already exists') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Failed to create role' });
  }
};

export const updateExistingRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validation = updateRoleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.error.issues });
    }
    const role = await updateRole(id, validation.data);
    return res.status(200).json({ success: true, message: 'Role updated successfully', data: role });
  } catch (error: any) {
    if (error.message === 'Role not found') return res.status(404).json({ success: false, message: error.message });
    if (error.message === 'Role already exists') return res.status(409).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Failed to update role' });
  }
};

export const removeRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await deleteRole(id);
    return res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Role not found') return res.status(404).json({ success: false, message: error.message });
    if (error.message && error.message.includes('assigned to users')) return res.status(409).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Failed to delete role' });
  }
};