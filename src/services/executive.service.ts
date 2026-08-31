import prisma from '../config/prisma';

/**
 * Get all executives
 */
export const getAllExecutives = async (
  page = 1,
  limit = 10,
  search?: string,
  tenantId?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    deleted_at: null,
    role: {
      name: 'EXECUTIVE',
      deleted_at: null,
    },
  };

  if (tenantId) {
    where.executive_branches = {
      some: {
        branch: {
          tenant_id: tenantId,
          deleted_at: null,
        },
        deleted_at: null,
      },
    };
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

  const [executives, total] =
    await Promise.all([
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

          executive_branches: {
            where: {
              deleted_at: null,
            },

            select: {
              id: true,

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
          },
        },
      }),

      prisma.staff.count({
        where,
      }),
    ]);

  return {
    executives,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


/**
 * Get one executive
 */
export const getExecutiveById = async (
  id: string
) => {
  return prisma.staff.findFirst({
    where: {
      id,
      deleted_at: null,
      role: {
        name: 'EXECUTIVE',
        deleted_at: null,
      },
    },

    select: {
      id: true,
      user_id: true,
      role_id: true,
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
          description: true,
        },
      },

      executive_branches: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          created_at: true,

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
      },
    },
  });
};


/**
 * Create executive
 *
 * The user must already exist.
 * We create a Staff record using the EXECUTIVE role.
 */
export const createExecutive = async (data: {
  user_id: string;
  branch_ids?: string[];
}) => {
  const user = await prisma.user.findFirst({
    where: {
      id: data.user_id,
      deleted_at: null,
      is_active: true,
    },
  });

  if (!user) {
    throw new Error(
      'User not found or inactive'
    );
  }

  const executiveRole =
    await prisma.role.findFirst({
      where: {
        name: 'EXECUTIVE',
        deleted_at: null,
      },
    });

  if (!executiveRole) {
    throw new Error(
      'EXECUTIVE role not found'
    );
  }

  const existingStaff =
    await prisma.staff.findFirst({
      where: {
        user_id: data.user_id,
        deleted_at: null,
      },
    });

  if (existingStaff) {
    throw new Error(
      'User is already a staff member'
    );
  }

  const branches =
    data.branch_ids?.length
      ? await prisma.branch.findMany({
          where: {
            id: {
              in: data.branch_ids,
            },
            deleted_at: null,
            is_active: true,
          },
        })
      : [];

  if (
    data.branch_ids &&
    branches.length !== data.branch_ids.length
  ) {
    throw new Error(
      'One or more branches were not found or are inactive'
    );
  }

  const executive =
    await prisma.staff.create({
      data: {
        user_id: data.user_id,
        role_id: executiveRole.id,
        hire_date: new Date(),
        employment_status: 'ACTIVE',
        is_active: true,

        executive_branches: {
          create: branches.map((branch) => ({
            branch_id: branch.id,
          })),
        },
      },

      select: {
        id: true,
        user_id: true,
        role_id: true,
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

        executive_branches: {
          where: {
            deleted_at: null,
          },

          select: {
            id: true,

            branch: {
              select: {
                id: true,
                branch_name: true,
                branch_code: true,
              },
            },
          },
        },
      },
    });

  return executive;
};


/**
 * Update executive
 */
export const updateExecutive = async (
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
  const executive =
    await prisma.staff.findFirst({
      where: {
        id,
        deleted_at: null,
        role: {
          name: 'EXECUTIVE',
          deleted_at: null,
        },
      },
    });

  if (!executive) {
    throw new Error(
      'Executive not found'
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
      role_id: true,
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
 * Soft delete executive
 */
export const deleteExecutive = async (
  id: string
) => {
  const executive =
    await prisma.staff.findFirst({
      where: {
        id,
        deleted_at: null,
        role: {
          name: 'EXECUTIVE',
          deleted_at: null,
        },
      },
    });

  if (!executive) {
    throw new Error(
      'Executive not found'
    );
  }

  return prisma.staff.update({
    where: {
      id,
    },

    data: {
      deleted_at: new Date(),
      is_active: false,
      employment_status: 'TERMINATED',
    },
  });
};


/**
 * Assign executive to branches
 */
export const assignExecutiveBranches =
  async (
    executiveId: string,
    branchIds: string[]
  ) => {
    const executive =
      await prisma.staff.findFirst({
        where: {
          id: executiveId,
          deleted_at: null,
          role: {
            name: 'EXECUTIVE',
            deleted_at: null,
          },
        },
      });

    if (!executive) {
      throw new Error(
        'Executive not found'
      );
    }

    const branches =
      await prisma.branch.findMany({
        where: {
          id: {
            in: branchIds,
          },
          deleted_at: null,
          is_active: true,
        },
      });

    if (
      branches.length !== branchIds.length
    ) {
      throw new Error(
        'One or more branches were not found or inactive'
      );
    }

    await prisma.executiveBranch.createMany({
      data: branchIds.map((branchId) => ({
        executive_id: executiveId,
        branch_id: branchId,
      })),
      skipDuplicates: true,
    });

    return getExecutiveById(
      executiveId
    );
  };


/**
 * Remove executive from a branch
 */
export const removeExecutiveFromBranch =
  async (
    executiveId: string,
    branchId: string
  ) => {
    const assignment =
      await prisma.executiveBranch.findFirst({
        where: {
          executive_id: executiveId,
          branch_id: branchId,
          deleted_at: null,
        },
      });

    if (!assignment) {
      throw new Error(
        'Executive is not assigned to this branch'
      );
    }

    await prisma.executiveBranch.update({
      where: {
        id: assignment.id,
      },

      data: {
        deleted_at: new Date(),
      },
    });

    return {
      success: true,
    };
  };