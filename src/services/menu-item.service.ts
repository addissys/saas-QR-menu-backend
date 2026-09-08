import prisma from '../config/prisma';

export const getAllMenuItems = async (
  branchId?: string,
  categoryId?: string,
  search?: string,
  tenantId?: string,
  branchIds?: string[]
) => {
  const where: any = {
    deleted_at: null,
  };

  if (branchId) {
    where.branch_id = branchId;
  }
  if (branchIds) where.branch_id = { in: branchIds };

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (tenantId) {
    where.branch = {
      tenant_id: tenantId,
      deleted_at: null,
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return prisma.menuItem.findMany({
    where,

    orderBy: {
      created_at: 'desc',
    },

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          tenant_id: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const getMenuItemById = async (
  id: string
) => {
  return prisma.menuItem.findFirst({
    where: {
      id,
      deleted_at: null,
    },

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          tenant_id: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
          description: true,
          sort_order: true,
        },
      },
    },
  });
};

export const createMenuItem = async (data: {
  branch_id?: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  preparation_time?: number | null;
  is_available?: boolean;
  is_featured?: boolean;
}) => {
  if (!data.branch_id && data.category_id) {
    const targetCategory = await prisma.category.findFirst({
      where: { id: data.category_id, deleted_at: null },
      select: { branch_id: true },
    });
    if (targetCategory) {
      data.branch_id = targetCategory.branch_id;
    }
  }

  if (!data.branch_id) {
    throw new Error('Branch ID is required to create a menu item');
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: data.branch_id,
      deleted_at: null,
      is_active: true,
    },
  });

  if (!branch) {
    throw new Error(
      'Branch not found or inactive'
    );
  }

  const category =
    await prisma.category.findFirst({
      where: {
        id: data.category_id,
        branch_id: data.branch_id,
        deleted_at: null,
        is_active: true,
      },
    });

  if (!category) {
    throw new Error(
      'Category not found or does not belong to this branch'
    );
  }

  const existingItem =
    await prisma.menuItem.findFirst({
      where: {
        branch_id: data.branch_id,
        category_id: data.category_id,
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
        deleted_at: null,
      },
    });

  if (existingItem) {
    throw new Error(
      'Menu item already exists in this category'
    );
  }

  return prisma.menuItem.create({
    data: {
      branch_id: data.branch_id,
      category_id: data.category_id,
      name: data.name,
      description: data.description,
      price: data.price,
      image_url: data.image_url ?? null,
      preparation_time:
        data.preparation_time ?? null,
      is_available:
        data.is_available ?? true,
      is_featured:
        data.is_featured ?? false,
    },

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          tenant_id: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const updateMenuItem = async (
  id: string,
  data: {
    category_id?: string;
    name?: string;
    description?: string | null;
    price?: number;
    image_url?: string | null;
    preparation_time?: number | null;
    is_available?: boolean;
    is_featured?: boolean;
  }
) => {
  const menuItem =
    await prisma.menuItem.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!menuItem) {
    throw new Error('Menu item not found');
  }

  if (data.category_id) {
    const category =
      await prisma.category.findFirst({
        where: {
          id: data.category_id,
          branch_id: menuItem.branch_id,
          deleted_at: null,
          is_active: true,
        },
      });

    if (!category) {
      throw new Error(
        'Category not found or does not belong to this branch'
      );
    }
  }

  if (data.name) {
    const existingItem =
      await prisma.menuItem.findFirst({
        where: {
          branch_id: menuItem.branch_id,
          category_id:
            data.category_id ??
            menuItem.category_id,

          name: {
            equals: data.name,
            mode: 'insensitive',
          },

          id: {
            not: id,
          },

          deleted_at: null,
        },
      });

    if (existingItem) {
      throw new Error(
        'Menu item already exists in this category'
      );
    }
  }

  return prisma.menuItem.update({
    where: {
      id,
    },

    data,

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          tenant_id: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteMenuItem = async (
  id: string
) => {
  const menuItem =
    await prisma.menuItem.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!menuItem) {
    throw new Error(
      'Menu item not found'
    );
  }

  return prisma.menuItem.update({
    where: {
      id,
    },

    data: {
      deleted_at: new Date(),
      is_available: false,
    },
  });
};