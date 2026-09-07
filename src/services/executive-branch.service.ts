import prisma from '../config/prisma';

/**
 * Assign an executive to a branch
 */
export const assignExecutiveToBranch = async (
  executiveId: string,
  branchId: string
) => {
  // Check executive
  const executive = await prisma.staff.findFirst({
    where: {
      id: executiveId,
      deleted_at: null,
      is_active: true,
    },
    include: {
      user: true,
      role: true,
    },
  });

  if (!executive) {
    throw new Error('Executive not found or inactive');
  }

  // Make sure this is actually an executive
  if (
    executive.role.name.toUpperCase() !== 'EXECUTIVE'
  ) {
    throw new Error(
      'Selected staff member is not an executive'
    );
  }

  // Check branch
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      deleted_at: null,
      is_active: true,
    },
  });

  if (!branch) {
    throw new Error('Branch not found or inactive');
  }

  const existingAssignment = await prisma.executiveBranch.findFirst({
    where: { branch_id: branchId, deleted_at: null },
  });
  if (existingAssignment && existingAssignment.executive_id !== executiveId) {
    throw new Error('This branch is already assigned to another executive');
  }

  await prisma.executiveBranch.upsert({
    where: { executive_id_branch_id: { executive_id: executiveId, branch_id: branchId } },
    create: { executive_id: executiveId, branch_id: branchId },
    update: { deleted_at: null },
  });

  return prisma.staff.findUniqueOrThrow({
    where: { id: executiveId },
    include: {
      user: { select: { id: true, full_name: true, email: true, phone: true } },
      role: { select: { id: true, name: true } },
      executive_branches: {
        where: { deleted_at: null },
        include: { branch: { select: { id: true, branch_name: true, branch_code: true, city: true, status: true } } },
      },
    },
  });
};

/**
 * Remove executive from branch
 */
export const removeExecutiveFromBranch = async (
  executiveId: string
) => {
  const executive = await prisma.staff.findFirst({
    where: {
      id: executiveId,
      deleted_at: null,
      is_active: true,
    },
    include: {
      role: true,
    },
  });

  if (!executive) {
    throw new Error('Executive not found or inactive');
  }

  if (
    executive.role.name.toUpperCase() !== 'EXECUTIVE'
  ) {
    throw new Error(
      'Selected staff member is not an executive'
    );
  }

  await prisma.executiveBranch.updateMany({
    where: { executive_id: executiveId, deleted_at: null },
    data: { deleted_at: new Date() },
  });
  return prisma.staff.findUniqueOrThrow({
    where: { id: executiveId },
    include: { user: { select: { id: true, full_name: true, email: true, phone: true } }, role: { select: { id: true, name: true } } },
  });
};

/**
 * Get all branches assigned to an executive
 */
export const getExecutiveBranches = async (
  executiveId: string
) => {
  const executive = await prisma.staff.findFirst({
    where: {
      id: executiveId,
      deleted_at: null,
    },
    include: {
      role: true,
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
  });

  if (!executive) {
    throw new Error('Executive not found');
  }

  if (
    executive.role.name.toUpperCase() !== 'EXECUTIVE'
  ) {
    throw new Error(
      'Selected staff member is not an executive'
    );
  }

  return prisma.executiveBranch.findMany({
    where: { executive_id: executiveId, deleted_at: null, branch: { deleted_at: null } },
    include: { branch: { select: { id: true, branch_name: true, branch_code: true, address: true, city: true, phone: true, status: true, is_active: true } } },
  });
};

/**
 * Get all executives assigned to a branch
 */
export const getBranchExecutives = async (
  branchId: string
) => {
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      deleted_at: null,
    },
  });

  if (!branch) {
    throw new Error('Branch not found');
  }

  return prisma.staff.findMany({
    where: {
      branch_id: branchId,
      deleted_at: null,
      is_active: true,
      role: {
        name: {
          equals: 'EXECUTIVE',
          mode: 'insensitive',
        },
        deleted_at: null,
      },
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
  });
};