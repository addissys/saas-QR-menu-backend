import prisma from '../config/prisma';
import { hashPassword } from '../utils/password';
import { createEmailVerification } from './email-verification.service';

/**
 * Get all users (optionally scoped to a tenant's staff)
 */
export const getAllUsers = async (tenantId?: string, branchIds?: string[]) => {
  // When tenantId is provided, filter to only users who are staff/owners of that tenant
  const staffFilter = tenantId || branchIds
    ? {
        some: {
          deleted_at: null,
          ...(branchIds ? { branch_id: { in: branchIds } } : { branch: { tenant_id: tenantId } }),
        },
      }
    : undefined;

  // Also include the tenant owner themselves
  const ownerFilter = tenantId && !branchIds
    ? {
        some: {
          id: tenantId,
          deleted_at: null,
        },
      }
    : undefined;

  return prisma.user.findMany({
    where: {
      deleted_at: null,
      ...((tenantId || branchIds) && {
        OR: [
          // Users who own this tenant
          { owned_tenants: ownerFilter },
          // Users who are staff in a branch of this tenant
          { staff_profile: staffFilter },
        ],
      }),
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      is_active: true,
      email_verified_at: true,
      created_at: true,
      updated_at: true,

      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },

      staff_profile: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              branch_name: true,
              tenant_id: true,
            },
          },
        },
      },
      permissions: {
        where: { deleted_at: null },
        select: {
          permission: {
            select: { id: true, permission: true, module: true, action: true },
          },
        },
      },
    },

    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * Get one user
 */
export const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deleted_at: null,
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      is_active: true,
      email_verified_at: true,
      created_at: true,
      updated_at: true,

      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },

      staff_profile: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              branch_name: true,
              tenant_id: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Create user
 */
export const createUser = async (data: {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role_id: string;
  branch_id?: string;
  branch_ids?: string[];
}) => {
  const email = data.email.toLowerCase().trim();

  // Check email
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error('Email is already registered');
  }

  // Check phone
  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: data.phone,
      },
    });

    if (existingPhone) {
      throw new Error('Phone number is already registered');
    }
  }

  // Check role
  const role = await prisma.role.findFirst({
    where: {
      id: data.role_id,
      deleted_at: null,
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  const isExecutive = role.name.toUpperCase() === 'EXECUTIVE';
  const isSuperAdmin = role.name.toUpperCase() === 'SUPER_ADMIN';
  const branchIds = [...new Set(data.branch_ids ?? (data.branch_id ? [data.branch_id] : []))];
  const user = await prisma.user.create({
    data: {
      full_name: data.full_name.trim(),
      email,
      phone: data.phone || null,
      password: passwordHash,
      role_id: data.role_id,
      ...(isSuperAdmin && {
        email_verified_at: new Date(),
      }),
      ...(!isExecutive && data.branch_id && {
        staff_profile: {
          create: {
            role_id: data.role_id,
            branch_id: data.branch_id,
            hire_date: new Date(),
            employment_status: 'ACTIVE',
            is_active: true,
          },
        },
      }),
      ...(isExecutive && branchIds.length > 0 ? {
        staff_profile: {
          create: {
            role_id: data.role_id,
            hire_date: new Date(),
            employment_status: 'ACTIVE',
            is_active: true,
            executive_branches: { create: branchIds.map((branch_id) => ({ branch_id })) },
          },
        },
      } : {}),
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      is_active: true,
      email_verified_at: true,
      created_at: true,

      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },

      staff_profile: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              branch_name: true,
              tenant_id: true,
            },
          },
        },
      },
    },
  });

  if (!isSuperAdmin) {
    await createEmailVerification(user.id, user.email);
  }

  return user;
};

/**
 * Update user
 */
export const updateUser = async (
  id: string,
  data: {
    full_name?: string;
    email?: string;
    phone?: string;
    role_id?: string;
    branch_id?: string;
    branch_ids?: string[];
  }
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Check email uniqueness
  if (data.email) {
    const email = data.email.toLowerCase().trim();

    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: {
          not: id,
        },
        deleted_at: null,
      },
    });

    if (emailExists) {
      throw new Error('Email is already registered');
    }

    data.email = email;
  }

  // Check phone uniqueness
  if (data.phone) {
    const phoneExists = await prisma.user.findFirst({
      where: {
        phone: data.phone,
        id: {
          not: id,
        },
        deleted_at: null,
      },
    });

    if (phoneExists) {
      throw new Error('Phone number is already registered');
    }
  }

  // Check role
  if (data.role_id) {
    const role = await prisma.role.findFirst({
      where: {
        id: data.role_id,
        deleted_at: null,
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }
  }

  // Update or create staff_profile if branch_id is provided
  if (data.branch_id) {
    const existingStaff = await prisma.staff.findFirst({
      where: {
        user_id: id,
        deleted_at: null,
      },
    });

    if (existingStaff) {
      await prisma.staff.update({
        where: { id: existingStaff.id },
        data: { branch_id: data.branch_id },
      });
    } else {
      await prisma.staff.create({
        data: {
          user_id: id,
          role_id: data.role_id || existingUser.role_id,
          branch_id: data.branch_id,
          hire_date: new Date(),
          employment_status: 'ACTIVE',
          is_active: true,
        },
      });
    }
  }

  if (data.branch_ids && data.role_id) {
    const targetRole = await prisma.role.findUnique({ where: { id: data.role_id }, select: { name: true } });
    if (targetRole?.name.toUpperCase() === 'EXECUTIVE') {
      const staff = await prisma.staff.findFirst({ where: { user_id: id, deleted_at: null } });
      if (staff) {
        await prisma.executiveBranch.updateMany({ where: { executive_id: staff.id, deleted_at: null }, data: { deleted_at: new Date() } });
        await prisma.executiveBranch.createMany({ data: [...new Set(data.branch_ids)].map((branch_id) => ({ executive_id: staff.id, branch_id })), skipDuplicates: true });
      }
    }
  }

  return prisma.user.update({
    where: {
      id,
    },

    data: {
      ...(data.full_name !== undefined && {
        full_name: data.full_name.trim(),
      }),

      ...(data.email !== undefined && {
        email: data.email,
      }),

      ...(data.phone !== undefined && {
        phone: data.phone || null,
      }),

      ...(data.role_id !== undefined && {
        role_id: data.role_id,
      }),
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      is_active: true,
      email_verified_at: true,
      updated_at: true,

      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },

      staff_profile: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              branch_name: true,
              tenant_id: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Soft delete user
 */
export const deleteUser = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.update({
    where: {
      id,
    },

    data: {
      deleted_at: new Date(),
      is_active: false,
    },
  });

  return {
    id,
  };
};

/**
 * Update user active status
 */
export const updateUserStatus = async (
  id: string,
  is_active: boolean
) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return prisma.user.update({
    where: {
      id,
    },

    data: {
      is_active,
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      is_active: true,
    },
  });
};

export const getUserPermissions = async (userId: string) => {
  return prisma.userPermission.findMany({
    where: { user_id: userId, deleted_at: null, permission: { deleted_at: null } },
    select: { permission: { select: { id: true, permission: true, module: true, action: true, description: true } } },
  });
};

export const assignUserPermissions = async (userId: string, permissionIds: string[]) => {
  const user = await prisma.user.findFirst({ where: { id: userId, deleted_at: null } });
  if (!user) throw new Error('User not found');
  const permissions = await prisma.permission.findMany({ where: { id: { in: [...new Set(permissionIds)] }, deleted_at: null } });
  if (permissions.length !== new Set(permissionIds).size) throw new Error('One or more permissions were not found');
  await prisma.userPermission.updateMany({
    where: { user_id: userId, deleted_at: null, permission_id: { notIn: [...new Set(permissionIds)] } },
    data: { deleted_at: new Date() },
  });
  for (const permission of permissions) {
    await prisma.userPermission.upsert({
      where: { user_id_permission_id: { user_id: userId, permission_id: permission.id } },
      create: { user_id: userId, permission_id: permission.id },
      update: { deleted_at: null },
    });
  }
  return getUserPermissions(userId);
};

export const revokeUserPermission = async (userId: string, permissionId: string) => {
  const assignment = await prisma.userPermission.findUnique({ where: { user_id_permission_id: { user_id: userId, permission_id: permissionId } } });
  if (!assignment || assignment.deleted_at) throw new Error('Permission is not assigned to this user');
  await prisma.userPermission.update({ where: { user_id_permission_id: { user_id: userId, permission_id: permissionId } }, data: { deleted_at: new Date() } });
  return getUserPermissions(userId);
};