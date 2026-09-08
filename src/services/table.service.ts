import prisma from '../config/prisma';

export const getAllTables = async (
  branchId?: string,
  tenantId?: string,
  branchIds?: string[]
) => {
  return prisma.table.findMany({
    where: {
      deleted_at: null,

      ...(branchId && {
        branch_id: branchId,
      }),

      ...(tenantId && {
        branch: {
          tenant_id: tenantId,
          deleted_at: null,
        },
      }),
      ...(branchIds && { branch_id: { in: branchIds } }),
    },

    orderBy: {
      table_number: 'asc',
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

      qr_code: {
        where: {
          deleted_at: null,
        },

        select: {
          id: true,
          qr_image_url: true,
          qr_token: true,
          public_url: true,
          expires_at: true,
          is_active: true,
        },
      },
    },
  });
};

export const getTableById = async (
  id: string
) => {
  return prisma.table.findFirst({
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
          city: true,
          tenant_id: true,
        },
      },

      qr_code: {
        where: {
          deleted_at: null,
        },
      },
    },
  });
};

export const createTable = async (data: {
  branch_id: string;
  table_number: string;
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

  const existingTable =
    await prisma.table.findFirst({
      where: {
        branch_id: data.branch_id,
        table_number: data.table_number,
        deleted_at: null,
      },
    });

  if (existingTable) {
    throw new Error(
      'Table number already exists in this branch'
    );
  }

  return prisma.table.create({
    data: {
      branch_id: data.branch_id,
      table_number: data.table_number,
      is_active:
        data.is_active ?? true,
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
    },
  });
};

export const updateTable = async (
  id: string,
  data: {
    table_number?: string;
    is_active?: boolean;
  }
) => {
  const table =
    await prisma.table.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!table) {
    throw new Error('Table not found');
  }

  if (data.table_number) {
    const existingTable =
      await prisma.table.findFirst({
        where: {
          branch_id: table.branch_id,
          table_number: data.table_number,
          id: {
            not: id,
          },
          deleted_at: null,
        },
      });

    if (existingTable) {
      throw new Error(
        'Table number already exists in this branch'
      );
    }
  }

  return prisma.table.update({
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
    },
  });
};

export const deleteTable = async (
  id: string
) => {
  const table =
    await prisma.table.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

  if (!table) {
    throw new Error('Table not found');
  }

  return prisma.table.update({
    where: {
      id,
    },

    data: {
      deleted_at: new Date(),
      is_active: false,
    },
  });
};