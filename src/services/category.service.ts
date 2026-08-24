import prisma from '../config/prisma';

export const getAllCategories = async (
  branchId?: string,
  search?: string
) => {
  const where: any = {
    deleted_at: null,
  };

  if (branchId) {
    where.branch_id = branchId;
  }

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  return prisma.category.findMany({
    where,

    orderBy: [
      {
        sort_order: 'asc',
      },
      {
        created_at: 'asc',
      },
    ],

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
        },
      },

      _count: {
        select: {
          menu_items: true,
        },
      },
    },
  });
};

export const getCategoryById = async (
  id: string
) => {
  return prisma.category.findFirst({
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
        },
      },

      menu_items: {
        where: {
          deleted_at: null,
        },

        orderBy: {
          created_at: 'desc',
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
      },
    },
  });
};

export const createCategory = async (data: {
  branch_id: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}) => {
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

  const existingCategory =
    await prisma.category.findFirst({
      where: {
        branch_id: data.branch_id,
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
        deleted_at: null,
      },
    });

  if (existingCategory) {
    throw new Error(
      'Category already exists in this branch'
    );
  }

  return prisma.category.create({
    data: {
      branch_id: data.branch_id,
      name: data.name,
      description: data.description,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    },

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
        },
      },
    },
  });
};

export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    description?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }
) => {
  const category =
    await prisma.category.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!category) {
    throw new Error(
      'Category not found'
    );
  }

  if (data.name) {
    const existingCategory =
      await prisma.category.findFirst({
        where: {
          branch_id: category.branch_id,
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

    if (existingCategory) {
      throw new Error(
        'Category already exists in this branch'
      );
    }
  }

  return prisma.category.update({
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
        },
      },
    },
  });
};

export const deleteCategory = async (
  id: string
) => {
  const category =
    await prisma.category.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!category) {
    throw new Error(
      'Category not found'
    );
  }

  return prisma.category.update({
    where: {
      id,
    },

    data: {
      deleted_at: new Date(),
      is_active: false,
    },
  });
};