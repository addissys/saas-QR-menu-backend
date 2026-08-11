import { getPlatformStatistics } from './statistics.service';
import prisma from '../config/prisma';

export const getAdminDashboard = async () => {
  const statistics = await getPlatformStatistics();

  return {
    statistics,
  };
};

interface SearchParams {
  query: string;
  type: 'all' | 'tenants' | 'users' | 'branches' | 'menu-items';
  page: number;
  limit: number;
}

export const searchPlatform = async ({
  query,
  type,
  page,
  limit,
}: SearchParams) => {
  const skip = (page - 1) * limit;

  const searchQuery = query.trim();

  const result = {
    tenants: [] as any[],
    users: [] as any[],
    branches: [] as any[],
    menuItems: [] as any[],
  };

  /*
   * TENANTS
   */
  if (type === 'all' || type === 'tenants') {
    const tenants = await prisma.tenant.findMany({
      where: {
        deleted_at: null,
        OR: [
          {
            business_name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            business_slug: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            city: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },

      select: {
        id: true,
        business_name: true,
        business_slug: true,
        logo_url: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        status: true,
        is_active: true,
        created_at: true,
      },

      skip,
      take: limit,

      orderBy: {
        created_at: 'desc',
      },
    });

    result.tenants = tenants;
  }

  /*
   * USERS
   */
  if (type === 'all' || type === 'users') {
    const users = await prisma.user.findMany({
      where: {
        deleted_at: null,
        OR: [
          {
            full_name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },

      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        profile_image: true,
        is_active: true,
        created_at: true,

        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      skip,
      take: limit,

      orderBy: {
        created_at: 'desc',
      },
    });

    result.users = users;
  }

  /*
   * BRANCHES
   */
  if (type === 'all' || type === 'branches') {
    const branches = await prisma.branch.findMany({
      where: {
        deleted_at: null,
        OR: [
          {
            branch_name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            branch_code: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            city: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            address: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },

      select: {
        id: true,
        branch_name: true,
        branch_code: true,
        address: true,
        city: true,
        phone: true,
        status: true,
        is_active: true,
        created_at: true,

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
                full_name: true,
                email: true,
              },
            },
          },
        },
      },

      skip,
      take: limit,

      orderBy: {
        created_at: 'desc',
      },
    });

    result.branches = branches;
  }

  /*
   * MENU ITEMS
   */
  if (type === 'menu-items' || type === 'all') {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        deleted_at: null,
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },

      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image_url: true,
        is_available: true,
        is_featured: true,
        created_at: true,

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

            tenant: {
              select: {
                id: true,
                business_name: true,
              },
            },
          },
        },
      },

      skip,
      take: limit,

      orderBy: {
        created_at: 'desc',
      },
    });

    result.menuItems = menuItems;
  }

  return result;
};