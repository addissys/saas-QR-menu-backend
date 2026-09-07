import crypto from 'crypto';
import QRCode from 'qrcode';

import prisma from '../config/prisma';

/**
 * Generate QR code for a table
 */
export const generateTableQr = async (
  tableId: string,
  generatedBy: string
) => {
  const table = await prisma.table.findFirst({
    where: {
      id: tableId,
      deleted_at: null,
      is_active: true,
    },

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          is_active: true,
        },
      },
    },
  });

  if (!table) {
    throw new Error(
      'Table not found or inactive'
    );
  }

  if (!table.branch.is_active) {
    throw new Error('Branch is inactive');
  }

  const generator = await prisma.user.findFirst({
    where: {
      id: generatedBy,
      deleted_at: null,
      is_active: true,
    },
  });

  if (!generator) {
    throw new Error(
      'QR generator user not found or inactive'
    );
  }

  // Return existing active QR instead of creating duplicate
  const existingQr =
    await prisma.qrCode.findFirst({
      where: {
        table_id: tableId,
        deleted_at: null,
        is_active: true,
      },

      include: {
        table: {
          select: {
            id: true,
            table_number: true,
          },
        },

        generator: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

  if (existingQr) {
    return {
      qr: existingQr,
      table,
    };
  }

  const qrToken =
    crypto.randomBytes(32).toString('hex');

  const frontendUrl =
    process.env.FRONTEND_URL ||
    'http://localhost:5173';

  const publicUrl =
    `${frontendUrl}/public/branches/${table.branch_id}/tables/${table.id}/menu`;

  const qrImageUrl =
    await QRCode.toDataURL(publicUrl);

  const qr = await prisma.qrCode.create({
    data: {
      table_id: table.id,
      generated_by: generatedBy,
      qr_image_url: qrImageUrl,
      qr_token: qrToken,
      public_url: publicUrl,
      is_active: true,
    },

    include: {
      table: {
        select: {
          id: true,
          table_number: true,
        },
      },

      generator: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  });

  return {
    qr,
    table,
  };
};


/**
 * Get QR code for a table
 */
export const getTableQr = async (
  tableId: string
) => {
  return prisma.qrCode.findFirst({
    where: {
      table_id: tableId,
      deleted_at: null,
    },

    include: {
      table: {
        select: {
          id: true,
          table_number: true,
          branch_id: true,
        },
      },
    },
  });
};


/**
 * Regenerate QR code
 *
 * Because table_id is unique in the database,
 * regeneration updates the existing QR record
 * instead of creating another record.
 */
export const regenerateTableQr = async (
  tableId: string,
  generatedBy: string
) => {
  const table = await prisma.table.findFirst({
    where: {
      id: tableId,
      deleted_at: null,
      is_active: true,
    },

    include: {
      branch: {
        select: {
          id: true,
          branch_name: true,
          branch_code: true,
          is_active: true,
        },
      },
    },
  });

  if (!table) {
    throw new Error(
      'Table not found or inactive'
    );
  }

  if (!table.branch.is_active) {
    throw new Error('Branch is inactive');
  }

  const generator = await prisma.user.findFirst({
    where: {
      id: generatedBy,
      deleted_at: null,
      is_active: true,
    },
  });

  if (!generator) {
    throw new Error(
      'QR generator user not found or inactive'
    );
  }

  const existingQr =
    await prisma.qrCode.findUnique({
      where: {
        table_id: tableId,
      },
    });

  const qrToken =
    crypto.randomBytes(32).toString('hex');

  const frontendUrl =
    process.env.FRONTEND_URL ||
    'http://localhost:5173';

  const publicUrl =
    `${frontendUrl}/public/branches/${table.branch_id}/tables/${table.id}/menu`;

  const qrImageUrl =
    await QRCode.toDataURL(publicUrl);

  if (existingQr) {
    const qr = await prisma.qrCode.update({
      where: {
        id: existingQr.id,
      },

      data: {
        generated_by: generatedBy,
        qr_image_url: qrImageUrl,
        qr_token: qrToken,
        public_url: publicUrl,
        expires_at: null,
        is_active: true,
        deleted_at: null,
        created_at: new Date(),
      },

      include: {
        table: {
          select: {
            id: true,
            table_number: true,
          },
        },

        generator: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return {
      qr,
      table,
    };
  }

  const qr = await prisma.qrCode.create({
    data: {
      table_id: table.id,
      generated_by: generatedBy,
      qr_image_url: qrImageUrl,
      qr_token: qrToken,
      public_url: publicUrl,
      is_active: true,
    },

    include: {
      table: {
        select: {
          id: true,
          table_number: true,
        },
      },

      generator: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  });

  return {
    qr,
    table,
  };
};


/**
 * Delete QR code
 */
export const deleteTableQr = async (
  tableId: string
) => {
  const qr = await prisma.qrCode.findFirst({
    where: {
      table_id: tableId,
      deleted_at: null,
    },
  });

  if (!qr) {
    throw new Error(
      'QR code not found'
    );
  }

  return prisma.qrCode.update({
    where: {
      id: qr.id,
    },

    data: {
      deleted_at: new Date(),
      is_active: false,
    },
  });
};

/**
 * List all QR codes
 */
export const getAllQrCodes = async (branchId?: string, tenantId?: string, branchIds?: string[]) => {
  const where: any = {
    deleted_at: null,
  };

  if (branchId) {
    where.table = {
      branch_id: branchId,
    };
  }

  if (tenantId) {
    where.table = {
      ...(where.table ?? {}),
      branch: {
        tenant_id: tenantId,
        deleted_at: null,
      },
    };
  }
  if (branchIds) where.table = { ...(where.table ?? {}), branch_id: { in: branchIds } };

  return prisma.qrCode.findMany({
    where,
    include: {
      table: {
        select: {
          id: true,
          table_number: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              branch_name: true,
            },
          },
        },
      },
      generator: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * Get QR code by ID
 */
export const getQrCodeById = async (id: string) => {
  const qr = await prisma.qrCode.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      table: {
        select: {
          id: true,
          table_number: true,
          branch_id: true,
          branch: {
            select: {
              id: true,
              branch_name: true,
            },
          },
        },
      },
      generator: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  });

  if (!qr) {
    throw new Error('QR code not found');
  }

  return qr;
};

/**
 * Download QR image
 */
export const downloadQrImage = async (id: string) => {
  const qr = await getQrCodeById(id);
  return qr.qr_image_url;
};

/**
 * Regenerate QR code by QR code ID
 */
export const regenerateQrById = async (id: string, generatedBy: string) => {
  const qr = await prisma.qrCode.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!qr) {
    throw new Error('QR code not found');
  }

  return regenerateTableQr(qr.table_id, generatedBy);
};

/**
 * Delete QR code by QR code ID
 */
export const deleteQrById = async (id: string) => {
  const qr = await prisma.qrCode.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!qr) {
    throw new Error('QR code not found');
  }

  return prisma.qrCode.update({
    where: {
      id,
    },
    data: {
      deleted_at: new Date(),
      is_active: false,
    },
  });
};
