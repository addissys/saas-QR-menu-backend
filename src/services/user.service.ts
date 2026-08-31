import prisma from '../config/prisma';
import { hashPassword } from '../utils/password';

/**
 * Get all users (optionally scoped to a tenant's staff)
 */
export const getAllUsers = async (tenantId?: string) => {
  // When tenantId is provided, filter to only users who are staff/owners of that tenant
  const staffFilter = tenantId
    ? {
        some: {
          deleted_at: null,
          branch: {
            tenant_id: tenantId,
          },
        },
      }
    : undefined;

  // Also include the tenant owner themselves
  const ownerFilter = tenantId
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
      ...(tenantId && {
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

  const user = await prisma.user.create({
    data: {
      full_name: data.full_name.trim(),
      email,
      phone: data.phone || null,
      password: passwordHash,
      role_id: data.role_id,
      ...(data.branch_id && {
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