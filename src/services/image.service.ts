import prisma from '../config/prisma';

export const updateMenuItemImage = async (
  menuItemId: string,
  imageUrl: string
) => {
  const menuItem =
    await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
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
      id: menuItemId,
    },

    data: {
      image_url: imageUrl,
    },

    include: {
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
          branch_code: true,
        },
      },
    },
  });
};