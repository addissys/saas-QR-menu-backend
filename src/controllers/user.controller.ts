import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { getScopedBranchIds, assertBranchAccess, findBranchForResource } from '../middleware/branch-scope.middleware';

const MANAGEMENT_ROLES: Record<string, string[]> = {
  SUPER_ADMIN: ['SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
  CAFE_OWNER: ['EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
  OWNER: ['EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
  RESTAURANT_OWNER: ['EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
  EXECUTIVE: ['BRANCH_MANAGER', 'STAFF'],
  BRANCH_MANAGER: ['STAFF'],
};

const assertUserManagementScope = async (req: Request, userId: string) => {
  const authReq = req as AuthenticatedRequest;
  const actorRole = authReq.user?.roleName?.toUpperCase();
  if (actorRole === 'SUPER_ADMIN') return;
  const target = await prisma.user.findFirst({
    where: { id: userId, deleted_at: null },
    select: {
      staff_profile: { where: { deleted_at: null }, select: { branch: { select: { id: true, tenant_id: true } } } },
      owned_tenants: { where: { deleted_at: null }, select: { id: true } },
      role: { select: { name: true } },
    },
  });
  const sameTenant = target?.staff_profile.some((staff) => staff.branch?.tenant_id === authReq.user?.tenantId);
  const ownsTenant = target?.owned_tenants.some((tenant) => tenant.id === authReq.user?.tenantId);
  if (!target) throw new Error('User not found');
  if (!sameTenant && !ownsTenant) throw new Error('You are not authorized to manage this user');
  if (!MANAGEMENT_ROLES[actorRole ?? '']?.includes(target.role.name.toUpperCase())) {
    throw new Error('You are not authorized to manage this user');
  }
  if (actorRole === 'EXECUTIVE' && target.staff_profile.length > 0 && authReq.user?.assignedBranchIds?.length) {
    const targetBranches = target.staff_profile.map((staff) => staff.branch?.id).filter(Boolean);
    if (!targetBranches.some((branchId) => authReq.user?.assignedBranchIds?.includes(branchId!))) {
      throw new Error('You are not authorized to manage this user');
    }
  }
};

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserPermissions,
  assignUserPermissions,
  revokeUserPermission,
} from '../services/user.service';

import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from '../validators/user.validator';

/**
 * GET /users
 * Get all users scoped to the authenticated user's tenant
 */
export const getUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperAdmin = authReq.user?.roleName?.toUpperCase() === 'SUPER_ADMIN';
    const requestedTenantId = typeof req.query.tenant_id === 'string' ? req.query.tenant_id : undefined;
    const tenantId = isSuperAdmin ? requestedTenantId : (authReq.user?.tenantId || undefined);

    const users = await getAllUsers(tenantId, getScopedBranchIds(req));

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

    const target = await prisma.user.findFirst({ where: { id, deleted_at: null }, select: { staff_profile: { where: { deleted_at: null }, select: { branch_id: true } } } });
    const scopedBranchIds = getScopedBranchIds(req);
    if (scopedBranchIds && (!target || !target.staff_profile.some((staff) => scopedBranchIds.includes(staff.branch_id ?? '')))) return res.status(403).json({ success: false, message: 'You are not authorized to access this user.' });
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
    const authReq = req as AuthenticatedRequest;
    const actorRole = authReq.user?.roleName?.toUpperCase();
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

    const targetRole = await prisma.role.findFirst({ where: { id: validation.data.role_id, deleted_at: null } });
    const roleHierarchy: Record<string, string[]> = {
      SUPER_ADMIN: ['SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
      CAFE_OWNER: ['EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
      OWNER: ['EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
      RESTAURANT_OWNER: ['EXECUTIVE', 'BRANCH_MANAGER', 'STAFF'],
      EXECUTIVE: ['BRANCH_MANAGER', 'STAFF'],
      BRANCH_MANAGER: ['STAFF'],
    };
    if (!targetRole || !actorRole || !roleHierarchy[actorRole]?.includes(targetRole.name.toUpperCase())) {
      return res.status(403).json({ success: false, message: 'You are not authorized to assign this role' });
    }
    const requestedBranches = validation.data.branch_ids ?? (validation.data.branch_id ? [validation.data.branch_id] : []);
    if (requestedBranches.length > 0 && actorRole !== 'SUPER_ADMIN') {
      const branches = await prisma.branch.findMany({ where: { id: { in: requestedBranches }, deleted_at: null } });
      if (branches.length !== new Set(requestedBranches).size || branches.some((branch) => branch.tenant_id !== authReq.user?.tenantId)) {
        return res.status(403).json({ success: false, message: 'You can only assign users to branches in your tenant' });
      }
      if ((actorRole === 'EXECUTIVE' || actorRole === 'BRANCH_MANAGER') && branches.some((branch) => !authReq.user?.assignedBranchIds?.includes(branch.id))) {
        return res.status(403).json({ success: false, message: 'You can only assign users to your authorized branches' });
      }
    }

    const user = await createUser(validation.data);

    return res.status(201).json({
      success: true,
      message: user.email_verified_at
        ? 'User created successfully.'
        : `User created successfully. Verification email sent to ${user.email}.`,
      data: {
        ...user,
        verification_email_sent: !user.email_verified_at,
      },
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

    if (
      error.message === 'SMTP credentials are not configured' ||
      error.message === 'Failed to send email verification message'
    ) {
      return res.status(503).json({
        success: false,
        message:
          'User was created, but the verification email could not be sent. Use the resend verification endpoint after fixing SMTP configuration.',
      });
    }

    if (
      error.code === 'P2021' &&
      error.message?.includes('email_verification_tokens')
    ) {
      return res.status(503).json({
        success: false,
        message:
          'User creation requires the email verification database migration. Apply the pending Prisma migration first.',
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
    const authReq = req as AuthenticatedRequest;
    const actorRole = authReq.user?.roleName?.toUpperCase();
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

    await assertUserManagementScope(req, id);
    if (validation.data.role_id || validation.data.branch_id) {
      const targetUser = await prisma.user.findFirst({ where: { id, deleted_at: null }, include: { role: true } });
      if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
      const targetRole = validation.data.role_id
        ? await prisma.role.findFirst({ where: { id: validation.data.role_id, deleted_at: null } })
        : targetUser.role;
      if (!targetRole || !actorRole || !MANAGEMENT_ROLES[actorRole]?.includes(targetRole.name.toUpperCase())) {
        return res.status(403).json({ success: false, message: 'You are not authorized to assign this role' });
      }
      const requestedBranches = validation.data.branch_ids ?? (validation.data.branch_id ? [validation.data.branch_id] : []);
      if (requestedBranches.length > 0 && actorRole !== 'SUPER_ADMIN') {
        const branches = await prisma.branch.findMany({ where: { id: { in: requestedBranches }, deleted_at: null } });
        if (branches.length !== new Set(requestedBranches).size || branches.some((branch) => branch.tenant_id !== authReq.user?.tenantId)) return res.status(403).json({ success: false, message: 'You can only assign users to branches in your tenant' });
        if ((actorRole === 'EXECUTIVE' || actorRole === 'BRANCH_MANAGER') && branches.some((branch) => !authReq.user?.assignedBranchIds?.includes(branch.id))) return res.status(403).json({ success: false, message: 'You can only assign users to your authorized branches' });
      }
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

    if (error.message.includes('not authorized') || error.message.includes('only assign')) {
      return res.status(403).json({ success: false, message: error.message });
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

    await assertUserManagementScope(req, id);

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

    if (error.message.includes('not authorized')) {
      return res.status(403).json({ success: false, message: error.message });
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

    await assertUserManagementScope(req, id);

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

    if (error.message.includes('not authorized')) {
      return res.status(403).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

export const listUserPermissions = async (req: Request, res: Response) => {
  try {
    await assertUserManagementScope(req, req.params.id as string);
    const permissions = await getUserPermissions(req.params.id as string);
    return res.status(200).json({ success: true, data: permissions.map((entry) => entry.permission) });
  } catch (error: any) {
    if (error.message?.includes('not authorized')) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve user permissions' });
  }
};

export const assignUserPermissionsController = async (req: Request, res: Response) => {
  try {
    await assertUserManagementScope(req, req.params.id as string);
    const permissionIds = Array.isArray(req.body.permission_ids) ? req.body.permission_ids : [];
    const permissions = await assignUserPermissions(req.params.id as string, permissionIds);
    return res.status(200).json({ success: true, data: permissions.map((entry) => entry.permission) });
  } catch (error: any) {
    if (error.message?.includes('not authorized')) return res.status(403).json({ success: false, message: error.message });
    return res.status(error.message === 'User not found' ? 404 : 400).json({ success: false, message: error.message || 'Failed to assign user permissions' });
  }
};

export const revokeUserPermissionController = async (req: Request, res: Response) => {
  try {
    await assertUserManagementScope(req, req.params.id as string);
    const permissions = await revokeUserPermission(req.params.id as string, req.params.permissionId as string);
    return res.status(200).json({ success: true, data: permissions.map((entry) => entry.permission) });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message || 'Permission not found' });
  }
};