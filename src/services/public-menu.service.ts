import prisma from '../config/prisma';

/**
 * Get all publicly available restaurant branches
 */
export const getPublicBranches = async () => {
  const branches = await prisma.branch.findMany({
    where: {
      is_active: true,
      deleted_at: null,
      status: 'ACTIVE',
      tenant: {
        is_active: true,
        deleted_at: null,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
    },
    select: {
      id: true,
      branch_name: true,
      branch_code: true,
      address: true,
      city: true,
      phone: true,
      tenant: {
        select: {
          id: true,
          business_name: true,
          business_slug: true,
          logo_url: true,
          brand_color: true,
        },
      },
    },
    orderBy: {
      branch_name: 'asc',
    },
  });

  return branches;
};

/**
 * Get complete public menu for a branch
 */
export const getBranchMenu = async (branchId: string) => {
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      is_active: true,
      deleted_at: null,
      status: 'ACTIVE',
      tenant: {
        is_active: true,
        deleted_at: null,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
    },
    select: {
      id: true,
      branch_name: true,
      branch_code: true,
      address: true,
      city: true,
      phone: true,
      tenant: {
        select: {
          id: true,
          business_name: true,
          business_slug: true,
          logo_url: true,
          brand_color: true,
        },
      },
      categories: {
        where: {
          is_active: true,
          deleted_at: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          sort_order: true,
          menu_items: {
            where: {
              is_active: true,
              deleted_at: null,
              is_available: true,
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
            orderBy: [
              {
                is_featured: 'desc',
              },
              {
                name: 'asc',
              },
            ],
          },
        },
        orderBy: {
          sort_order: 'asc',
        },
      },
    },
  });

  if (!branch) {
    throw new Error('Branch not found or public menu is unavailable');
  }

  return branch;
};

/**
 * Get menu through a restaurant table.
 *
 * This endpoint is used when a customer scans a table QR code.
 */
export const getTableMenu = async (
  branchId: string,
  tableId: string
) => {
  const table = await prisma.table.findFirst({
    where: {
      id: tableId,
      branch_id: branchId,
      is_active: true,
      deleted_at: null,
      branch: {
        is_active: true,
        deleted_at: null,
        status: 'ACTIVE',
        tenant: {
          is_active: true,
          deleted_at: null,
          status: {
            in: ['ACTIVE', 'TRIAL'],
          },
        },
      },
    },
    select: {
      id: true,
      table_number: true,
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          address: true,
          city: true,
          tenant: {
            select: {
              id: true,
              business_name: true,
              business_slug: true,
              logo_url: true,
              brand_color: true,
            },
          },
          categories: {
            where: {
              is_active: true,
              deleted_at: null,
            },
            select: {
              id: true,
              name: true,
              description: true,
              sort_order: true,
              menu_items: {
                where: {
                  is_active: true,
                  deleted_at: null,
                  is_available: true,
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
                orderBy: [
                  {
                    is_featured: 'desc',
                  },
                  {
                    name: 'asc',
                  },
                ],
              },
            },
            orderBy: {
              sort_order: 'asc',
            },
          },
        },
      },
    },
  });

  if (!table) {
    throw new Error('Table not found or public menu is unavailable');
  }

  return table;
};

/**
 * Search publicly available menu items
 */
export const searchPublicMenu = async (
  query: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const where = {
    is_available: true,
    deleted_at: null,
    branch: {
      is_active: true,
      deleted_at: null,
      status: 'ACTIVE' as const,
      tenant: {
        is_active: true,
        deleted_at: null,
        status: {
          in: ['ACTIVE', 'TRIAL'] as any,
        },
      },
    },
    OR: [
      {
        name: {
          contains: query,
          mode: 'insensitive' as const,
        },
      },
      {
        description: {
          contains: query,
          mode: 'insensitive' as const,
        },
      },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image_url: true,
        preparation_time: true,
        is_available: true,
        is_featured: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            branch_name: true,
            city: true,
            tenant: {
              select: {
                id: true,
                business_name: true,
                business_slug: true,
                logo_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),

    prisma.menuItem.count({
      where,
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};