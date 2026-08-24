import prisma from '../config/prisma';

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

  const [tenants, total] =
    await Promise.all([
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
      totalPages: Math.ceil(
        total / limit
      ),
    },
  };
};

export const getTenantById = async (
  id: string
) => {
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

export const createTenant = async (
  data: {
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
  }
) => {
  const owner =
    await prisma.user.findFirst({
      where: {
        id: data.owner_id,
        deleted_at: null,
        is_active: true,
      },
    });

  if (!owner) {
    throw new Error(
      'Owner user not found'
    );
  }

  const existingSlug =
    await prisma.tenant.findFirst({
      where: {
        business_slug:
          data.business_slug,
        deleted_at: null,
      },
    });

  if (existingSlug) {
    throw new Error(
      'Business slug already exists'
    );
  }

  const existingEmail =
    await prisma.tenant.findFirst({
      where: {
        email: data.email,
        deleted_at: null,
      },
    });

  if (existingEmail) {
    throw new Error(
      'Business email already exists'
    );
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
  data: any
) => {
  const tenant =
    await prisma.tenant.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!tenant) {
    throw new Error(
      'Tenant not found'
    );
  }

  if (data.business_slug) {
    const existingSlug =
      await prisma.tenant.findFirst({
        where: {
          business_slug:
            data.business_slug,
          id: {
            not: id,
          },
          deleted_at: null,
        },
      });

    if (existingSlug) {
      throw new Error(
        'Business slug already exists'
      );
    }
  }

  if (data.email) {
    const existingEmail =
      await prisma.tenant.findFirst({
        where: {
          email: data.email,
          id: {
            not: id,
          },
          deleted_at: null,
        },
      });

    if (existingEmail) {
      throw new Error(
        'Business email already exists'
      );
    }
  }

  return prisma.tenant.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteTenant = async (
  id: string
) => {
  const tenant =
    await prisma.tenant.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!tenant) {
    throw new Error(
      'Tenant not found'
    );
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