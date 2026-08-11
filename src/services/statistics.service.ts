import prisma from '../config/prisma';

export const getPlatformStatistics = async () => {
  const [
    totalTenants,
    activeTenants,
    totalUsers,
    totalBranches,
    activeBranches,
    totalMenuItems,
  ] = await Promise.all([
    prisma.tenant.count({
      where: {
        deleted_at: null,
      },
    }),

    prisma.tenant.count({
      where: {
        status: 'ACTIVE',
        deleted_at: null,
      },
    }),

    prisma.user.count({
      where: {
        deleted_at: null,
      },
    }),

    prisma.branch.count({
      where: {
        deleted_at: null,
      },
    }),

    prisma.branch.count({
      where: {
        status: 'ACTIVE',
        deleted_at: null,
      },
    }),

    prisma.menuItem.count({
      where: {
        deleted_at: null,
      },
    }),
  ]);

  return {
    tenants: {
      total: totalTenants,
      active: activeTenants,
    },

    users: {
      total: totalUsers,
    },

    branches: {
      total: totalBranches,
      active: activeBranches,
    },

    menuItems: {
      total: totalMenuItems,
    },
  };
};