import { Request, Response } from 'express';

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from '../services/user.service';

import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from '../validators/user.validator';

/**
 * GET /users
 * Get all users
 */
export const getUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error: any) {
    console.error('Get users error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
    });
  }
};

/**
 * GET /users/:id
 * Get user by ID
 */
export const getUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Get user error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
    });
  }
};

/**
 * POST /users
 * Create new user
 */
export const createNewUser = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = createUserSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const user = await createUser(validation.data);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Create user error:', error);

    if (
      error.message === 'Email is already registered' ||
      error.message === 'Phone number is already registered'
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

/**
 * PATCH /users/:id
 * Update user
 */
export const updateExistingUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const validation = updateUserSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const user = await updateUser(
      id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Update user error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (
      error.message === 'Email is already registered' ||
      error.message === 'Phone number is already registered'
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

/**
 * DELETE /users/:id
 * Delete user
 */
export const removeUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    await deleteUser(id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

/**
 * PATCH /users/:id/status
 * Activate / deactivate user
 */
export const changeUserStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const validation =
      updateUserStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const user = await updateUserStatus(
      id,
      validation.data.is_active
    );

    return res.status(200).json({
      success: true,
      message: validation.data.is_active
        ? 'User activated successfully'
        : 'User deactivated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error(
      'Update user status error:',
      error
    );

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};