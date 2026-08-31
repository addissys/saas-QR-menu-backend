import prisma from '../config/prisma';

/**
 * Get all roles
 */
export const getAllRoles = async () => {
  return prisma.role.findMany({
    where: {
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * Get role by ID
 */
export const getRoleById = async (id: string) => {
  const role = await prisma.role.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  return role;
};

/**
 * Create role
 */
export const createRole = async (data: {
  name: string;
  description?: string;
}) => {
  const name = data.name.trim().toUpperCase();

  // Check duplicate role
  const existingRole = await prisma.role.findFirst({
    where: {
      name,
      deleted_at: null,
    },
  });

  if (existingRole) {
    throw new Error('Role already exists');
  }

  const role = await prisma.role.create({
    data: {
      name,
      description: data.description?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      created_at: true,
      updated_at: true,
    },
  });

  return role;
};

/**
 * Update role
 */
export const updateRole = async (
  id: string,
  data: {
    name?: string;
    description?: string;
  }
) => {
  const existingRole = await prisma.role.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!existingRole) {
    throw new Error('Role not found');
  }

  let roleName: string | undefined;

  if (data.name !== undefined) {
    roleName = data.name.trim().toUpperCase();

    const duplicateRole = await prisma.role.findFirst({
      where: {
        name: roleName,
        id: {
          not: id,
        },
        deleted_at: null,
      },
    });

    if (duplicateRole) {
      throw new Error('Role already exists');
    }
  }

  const role = await prisma.role.update({
    where: {
      id,
    },
    data: {
      ...(roleName !== undefined && {
        name: roleName,
      }),

      ...(data.description !== undefined && {
        description: data.description.trim(),
      }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      created_at: true,
      updated_at: true,
    },
  });

  return role;
};

/**
 * Delete role
 *
 * The database documentation says system roles
 * cannot be deleted.
 *
 * Therefore we use soft delete only when allowed.
 */
export const deleteRole = async (id: string) => {
  const role = await prisma.role.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  /**
   * Check whether users are currently using this role.
   */
  const usersUsingRole = await prisma.user.count({
    where: {
      role_id: id,
      deleted_at: null,
    },
  });

  if (usersUsingRole > 0) {
    throw new Error(
      'Cannot delete role because it is assigned to users'
    );
  }

  /**
   * Soft delete
   */
  await prisma.role.update({
    where: {
      id,
    },
    data: {
      deleted_at: new Date(),
    },
  });
};

/**
 * List user role assignments
 */
export const getUserRoleAssignments = async () => {
  const users = await prisma.user.findMany({
    where: {
      deleted_at: null,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      is_active: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      created_at: true,
      updated_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return users;
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (data: { user_id: string; role_id: string }) => {
  const user = await prisma.user.findFirst({
    where: {
      id: data.user_id,
      deleted_at: null,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const role = await prisma.role.findFirst({
    where: {
      id: data.role_id,
      deleted_at: null,
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: data.user_id,
    },
    data: {
      role_id: data.role_id,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      updated_at: true,
    },
  });

  return updatedUser;
};

/**
 * Update role assignment for a user
 */
export const updateUserRoleAssignment = async (userId: string, roleId: string) => {
  return assignRoleToUser({ user_id: userId, role_id: roleId });
};

/**
 * Revoke role assignment from user
 */
export const revokeUserRoleAssignment = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deleted_at: null,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Set user as inactive or update status if needed
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      is_active: false,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      is_active: true,
    },
  });
};