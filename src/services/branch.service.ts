import prisma from '../config/prisma';

interface GetBranchesParams {
  page: number;
  limit: number;
  tenant_id?: string;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  branch_ids?: string[];
}

export const getAllBranches = async ({
  page,
  limit,
  tenant_id,
  search,
  status,
  branch_ids,
}: GetBranchesParams) => {
  const skip = (page - 1) * limit;

  const where: any = {
    deleted_at: null,
  };

  if (tenant_id) {
    where.tenant_id = tenant_id;
  }

  if (branch_ids && branch_ids.length > 0) {
    where.id = { in: branch_ids };
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      {
        branch_name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        branch_code: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        city: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        address: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [branches, total] = await Promise.all([
    prisma.branch.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        created_at: 'desc',
      },

      include: {
        tenant: {
          select: {
            id: true,
            business_name: true,
            business_slug: true,
          },
        },

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

            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        _count: {
          select: {
            staff: true,
            categories: true,
            menu_items: true,
            tables: true,
          },
        },
      },
    }),

    prisma.branch.count({
      where,
    }),
  ]);

  return {
    branches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBranchById = async (
  id: string
) => {
  return prisma.branch.findFirst({
    where: {
      id,
      deleted_at: null,
    },

    include: {
      tenant: {
        select: {
          id: true,
          business_name: true,
          business_slug: true,
          email: true,
          phone: true,
        },
      },

      manager: {
        select: {
          id: true,

          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              profile_image: true,
            },
          },

          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      staff: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
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
      },

      categories: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          name: true,
          description: true,
          sort_order: true,
          is_active: true,
        },

        orderBy: {
          sort_order: 'asc',
        },
      },

      menu_items: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image_url: true,
          preparation_time: true,
          is_available: true,
          is_featured: true,
        },

        orderBy: {
          created_at: 'desc',
        },
      },

      tables: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          table_number: true,
          is_active: true,
        },

        orderBy: {
          table_number: 'asc',
        },
      },
    },
  });
};

export const createBranch = async (data: {
  tenant_id: string;
  branch_name: string;
  branch_code: string;
  address: string;
  city: string;
  phone?: string;
  manager_id?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  is_active?: boolean;
}) => {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: data.tenant_id,
      deleted_at: null,
      is_active: true,
    },
  });

  if (!tenant) {
    throw new Error(
      'Tenant not found or inactive'
    );
  }

  const existingBranch =
    await prisma.branch.findFirst({
      where: {
        branch_code: data.branch_code,
        deleted_at: null,
      },
    });

  if (existingBranch) {
    throw new Error(
      'Branch code already exists'
    );
  }

  if (data.manager_id) {
    const manager =
      await prisma.staff.findFirst({
        where: {
          id: data.manager_id,
          deleted_at: null,
          is_active: true,
        },
      });

    if (!manager) {
      throw new Error(
        'Branch manager not found or inactive'
      );
    }
  }

  return prisma.branch.create({
    data: {
      tenant_id: data.tenant_id,
      branch_name: data.branch_name,
      branch_code: data.branch_code,
      address: data.address,
      city: data.city,
      phone: data.phone,
      manager_id: data.manager_id,
      status: data.status ?? 'ACTIVE',
      is_active: data.is_active ?? true,
    },

    include: {
      tenant: {
        select: {
          id: true,
          business_name: true,
        },
      },

      manager: {
        select: {
          id: true,

          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const updateBranch = async (
  id: string,
  data: {
    branch_name?: string;
    branch_code?: string;
    address?: string;
    city?: string;
    phone?: string;
    manager_id?: string | null;
    status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    is_active?: boolean;
  }
) => {
  const branch =
    await prisma.branch.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!branch) {
    throw new Error('Branch not found');
  }

  if (data.branch_code) {
    const existingBranch =
      await prisma.branch.findFirst({
        where: {
          branch_code: data.branch_code,
          id: {
            not: id,
          },
          deleted_at: null,
        },
      });

    if (existingBranch) {
      throw new Error(
        'Branch code already exists'
      );
    }
  }

  if (data.manager_id) {
    const manager =
      await prisma.staff.findFirst({
        where: {
          id: data.manager_id,
          deleted_at: null,
          is_active: true,
        },
      });

    if (!manager) {
      throw new Error(
        'Branch manager not found or inactive'
      );
    }
  }

  return prisma.branch.update({
    where: {
      id,
    },

    data,

    include: {
      tenant: {
        select: {
          id: true,
          business_name: true,
        },
      },

      manager: {
        select: {
          id: true,

          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const softDeleteBranch = async (
  id: string
) => {
  const branch =
    await prisma.branch.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!branch) {
    throw new Error('Branch not found');
  }

  return prisma.branch.update({
    where: {
      id,
    },

    data: {
      deleted_at: new Date(),
      is_active: false,
      status: 'INACTIVE',
    },
  });
};