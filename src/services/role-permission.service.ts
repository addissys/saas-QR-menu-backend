import prisma from '../config/prisma';

/**
 * Get all active permissions assigned to a role
 */
export const getRolePermissions = async (
  roleId: string
) => {
  // Check if role exists
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  const rolePermissions =
    await prisma.rolePermission.findMany({
      where: {
        role_id: roleId,
        deleted_at: null,
        permission: {
          deleted_at: null,
        },
      },
      include: {
        permission: {
          select: {
            id: true,
            permission: true,
            module: true,
            action: true,
            description: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

  return {
    role,
    permissions: rolePermissions.map(
      (rolePermission) =>
        rolePermission.permission
    ),
  };
};

/**
 * Assign one or more permissions to a role
 */
export const assignPermissionsToRole = async (
  roleId: string,
  permissionIds: string[]
) => {
  // Check role
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deleted_at: null,
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  // Remove duplicate IDs from request
  const uniquePermissionIds = [
    ...new Set(permissionIds),
  ];

  // Check that all permissions exist
  const permissions =
    await prisma.permission.findMany({
      where: {
        id: {
          in: uniquePermissionIds,
        },
        deleted_at: null,
      },
      select: {
        id: true,
        permission: true,
        module: true,
        action: true,
        description: true,
      },
    });

  if (
    permissions.length !==
    uniquePermissionIds.length
  ) {
    throw new Error(
      'One or more permissions were not found'
    );
  }

  const assignedPermissions = [];

  for (const permissionId of uniquePermissionIds) {
    const existing =
      await prisma.rolePermission.findUnique({
        where: {
          role_id_permission_id: {
            role_id: roleId,
            permission_id: permissionId,
          },
        },
      });

    if (existing) {
      // Already active
      if (!existing.deleted_at) {
        assignedPermissions.push(
          permissionId
        );
        continue;
      }

      // Previously revoked → restore it
      await prisma.rolePermission.update({
        where: {
          role_id_permission_id: {
            role_id: roleId,
            permission_id: permissionId,
          },
        },
        data: {
          deleted_at: null,
          updated_at: new Date(),
        },
      });

      assignedPermissions.push(permissionId);
      continue;
    }

    // New assignment
    await prisma.rolePermission.create({
      data: {
        role_id: roleId,
        permission_id: permissionId,
      },
    });

    assignedPermissions.push(permissionId);
  }

  return getRolePermissions(roleId);
};

/**
 * Revoke a permission from a role
 * Uses soft delete.
 */
export const revokePermissionFromRole =
  async (
    roleId: string,
    permissionId: string
  ) => {
    // Check role
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        deleted_at: null,
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check permission
    const permission =
      await prisma.permission.findFirst({
        where: {
          id: permissionId,
          deleted_at: null,
        },
      });

    if (!permission) {
      throw new Error('Permission not found');
    }

    // Find assignment
    const rolePermission =
      await prisma.rolePermission.findUnique({
        where: {
          role_id_permission_id: {
            role_id: roleId,
            permission_id: permissionId,
          },
        },
      });

    if (
      !rolePermission ||
      rolePermission.deleted_at
    ) {
      throw new Error(
        'Permission is not assigned to this role'
      );
    }

    // Soft delete assignment
    await prisma.rolePermission.update({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId,
        },
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      role_id: roleId,
      permission_id: permissionId,
    };
  };