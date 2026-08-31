import prisma from '../config/prisma';

/**
 * Get all branch managers
 */
export const getAllBranchManagers = async (
  page = 1,
  limit = 10,
  search?: string,
  tenantId?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    deleted_at: null,

    role: {
      name: {
        equals: 'BRANCH_MANAGER',
        mode: 'insensitive',
      },
      deleted_at: null,
    },
  };

  if (tenantId) {
    where.OR = [
      {
        branch: {
          tenant_id: tenantId,
          deleted_at: null,
        },
      },
      {
        managed_branches: {
          some: {
            tenant_id: tenantId,
            deleted_at: null,
          },
        },
      },
    ];
  }

  if (search) {
    where.user = {
      OR: [
        {
          full_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  const [managers, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        created_at: 'desc',
      },

      select: {
        id: true,
        user_id: true,
        role_id: true,
        branch_id: true,
        hire_date: true,
        employment_status: true,
        is_active: true,
        created_at: true,
        updated_at: true,

        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            profile_image: true,
            is_active: true,
          },
        },

        role: {
          select: {
            id: true,
            name: true,
          },
        },

        branch: {
          select: {
            id: true,
            branch_name: true,
            branch_code: true,
            city: true,
            status: true,
          },
        },
      },
    }),

    prisma.staff.count({
      where,
    }),
  ]);

  return {
    managers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


/**
 * Get one branch manager
 */
export const getBranchManagerById = async (
  id: string
) => {
  return prisma.staff.findFirst({
    where: {
      id,
      deleted_at: null,

      role: {
        name: {
          equals: 'BRANCH_MANAGER',
          mode: 'insensitive',
        },
        deleted_at: null,
      },
    },

    select: {
      id: true,
      user_id: true,
      role_id: true,
      branch_id: true,
      hire_date: true,
      employment_status: true,
      is_active: true,
      created_at: true,
      updated_at: true,

      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
          is_active: true,
        },
      },

      role: {
        select: {
          id: true,
          name: true,
        },
      },

      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          address: true,
          city: true,
          phone: true,
          status: true,
          is_active: true,
        },
      },
    },
  });
};


/**
 * Create branch manager
 *
 * The User must already exist.
 */
export const createBranchManager = async (
  user_id: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: user_id,
      deleted_at: null,
      is_active: true,
    },
  });

  if (!user) {
    throw new Error(
      'User not found or inactive'
    );
  }

  const managerRole =
    await prisma.role.findFirst({
      where: {
        name: {
          equals: 'BRANCH_MANAGER',
          mode: 'insensitive',
        },
        deleted_at: null,
      },
    });

  if (!managerRole) {
    throw new Error(
      'BRANCH_MANAGER role not found'
    );
  }

  const existingStaff =
    await prisma.staff.findFirst({
      where: {
        user_id,
        deleted_at: null,
      },
    });

  if (existingStaff) {
    throw new Error(
      'User is already assigned as staff'
    );
  }

  return prisma.staff.create({
    data: {
      user_id,
      role_id: managerRole.id,
      hire_date: new Date(),
      employment_status: 'ACTIVE',
      is_active: true,
    },

    select: {
      id: true,
      user_id: true,
      role_id: true,
      branch_id: true,
      hire_date: true,
      employment_status: true,
      is_active: true,

      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
        },
      },

      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};


/**
 * Update branch manager
 */
export const updateBranchManager = async (
  id: string,
  data: {
    is_active?: boolean;
    employment_status?:
      | 'ACTIVE'
      | 'INACTIVE'
      | 'SUSPENDED'
      | 'TERMINATED';
  }
) => {
  const manager =
    await getBranchManagerById(id);

  if (!manager) {
    throw new Error(
      'Branch manager not found'
    );
  }

  return prisma.staff.update({
    where: {
      id,
    },

    data,

    select: {
      id: true,
      user_id: true,
      branch_id: true,
      hire_date: true,
      employment_status: true,
      is_active: true,

      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
        },
      },

      role: {
        select: {
          id: true,
          name: true,
        },
      },

      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          city: true,
        },
      },
    },
  });
};


/**
 * Delete / deactivate manager
 */
export const deleteBranchManager = async (
  id: string
) => {
  const manager =
    await getBranchManagerById(id);

  if (!manager) {
    throw new Error(
      'Branch manager not found'
    );
  }

  // Remove manager from the branch first
  if (manager.branch_id) {
    await prisma.branch.update({
      where: {
        id: manager.branch_id,
      },

      data: {
        manager_id: null,
      },
    });
  }

  return prisma.staff.update({
    where: {
      id,
    },

    data: {
      branch_id: null,
      deleted_at: new Date(),
      is_active: false,
      employment_status: 'TERMINATED',
    },
  });
};


/**
 * Assign manager to branch
 */
export const assignManagerToBranch = async (
  managerId: string,
  branchId: string
) => {
  const manager =
    await prisma.staff.findFirst({
      where: {
        id: managerId,
        deleted_at: null,
        is_active: true,

        role: {
          name: {
            equals: 'BRANCH_MANAGER',
            mode: 'insensitive',
          },
          deleted_at: null,
        },
      },
    });

  if (!manager) {
    throw new Error(
      'Branch manager not found or inactive'
    );
  }

  const branch =
    await prisma.branch.findFirst({
      where: {
        id: branchId,
        deleted_at: null,
        is_active: true,
      },
    });

  if (!branch) {
    throw new Error(
      'Branch not found or inactive'
    );
  }

  // A branch can have only one manager
  if (
    branch.manager_id &&
    branch.manager_id !== managerId
  ) {
    throw new Error(
      'This branch already has a manager'
    );
  }

  // A manager should manage only one branch
  if (
    manager.branch_id &&
    manager.branch_id !== branchId
  ) {
    throw new Error(
      'This manager is already assigned to another branch'
    );
  }

  // Keep both relationships synchronized
  await prisma.staff.update({
    where: {
      id: managerId,
    },

    data: {
      branch_id: branchId,
    },
  });

  return prisma.branch.update({
    where: {
      id: branchId,
    },

    data: {
      manager_id: managerId,
    },

    include: {
      manager: {
        select: {
          id: true,

          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
};


/**
 * Remove manager from branch
 */
export const removeManagerFromBranch = async (
  managerId: string,
  branchId: string
) => {
  const manager =
    await prisma.staff.findFirst({
      where: {
        id: managerId,
        branch_id: branchId,
        deleted_at: null,
      },
    });

  if (!manager) {
    throw new Error(
      'Manager is not assigned to this branch'
    );
  }

  await prisma.branch.update({
    where: {
      id: branchId,
    },

    data: {
      manager_id: null,
    },
  });

  return prisma.staff.update({
    where: {
      id: managerId,
    },

    data: {
      branch_id: null,
    },
  });
};