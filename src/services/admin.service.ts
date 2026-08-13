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


export const getAllTenants = async (
  page = 1,
  limit = 10,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    deleted_at: null,
  };

  if (search) {
    where.OR = [
      {
        business_name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        business_slug: {
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
    ];
  }

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        branches: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            branch_name: true,
            branch_code: true,
            status: true,
          },
        },
      },
    }),

    prisma.tenant.count({
      where,
    }),
  ]);

  return {
    tenants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


export const getTenantById = async (id: string) => {
  return prisma.tenant.findFirst({
    where: {
      id,
      deleted_at: null,
    },

    include: {
      owner: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
        },
      },

      branches: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          city: true,
          status: true,
        },
      },
    },
  });
};


export const createTenant = async (data: {
  owner_id: string;
  business_name: string;
  business_slug: string;
  logo_url?: string;
  brand_color?: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  country: string;
}) => {
  const owner = await prisma.user.findFirst({
    where: {
      id: data.owner_id,
      deleted_at: null,
    },
  });

  if (!owner) {
    throw new Error('Owner user not found');
  }

  const existingSlug = await prisma.tenant.findFirst({
    where: {
      business_slug: data.business_slug,
      deleted_at: null,
    },
  });

  if (existingSlug) {
    throw new Error('Business slug already exists');
  }

  const existingEmail = await prisma.tenant.findFirst({
    where: {
      email: data.email,
      deleted_at: null,
    },
  });

  if (existingEmail) {
    throw new Error('Business email already exists');
  }

  return prisma.tenant.create({
    data: {
      owner_id: data.owner_id,
      business_name: data.business_name,
      business_slug: data.business_slug,
      logo_url: data.logo_url,
      brand_color: data.brand_color,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      status: 'PENDING',
      is_active: true,
    },
  });
};


export const updateTenant = async (
  id: string,
  data: {
    business_name?: string;
    business_slug?: string;
    logo_url?: string;
    brand_color?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }
) => {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!tenant) {
    throw new Error('Restaurant not found');
  }

  if (data.business_slug) {
    const existingSlug = await prisma.tenant.findFirst({
      where: {
        business_slug: data.business_slug,
        id: {
          not: id,
        },
        deleted_at: null,
      },
    });

    if (existingSlug) {
      throw new Error('Business slug already exists');
    }
  }

  if (data.email) {
    const existingEmail = await prisma.tenant.findFirst({
      where: {
        email: data.email,
        id: {
          not: id,
        },
        deleted_at: null,
      },
    });

    if (existingEmail) {
      throw new Error('Business email already exists');
    }
  }

  return prisma.tenant.update({
    where: {
      id,
    },

    data,
  });
};


export const softDeleteTenant = async (id: string) => {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!tenant) {
    throw new Error('Restaurant not found');
  }

  return prisma.tenant.update({
    where: {
      id,
    },

    data: {
      deleted_at: new Date(),
      is_active: false,
    },
  });
};