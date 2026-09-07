import prisma from '../config/prisma';

interface CreateAuditLogData {
  user_id?: string;
  tenant_id?: string;
  module: string;
  action: string;
  entity_name?: string;
  entity_id?: string;
  old_values?: unknown;
  new_values?: unknown;
  ip_address?: string;
  user_agent?: string;
  user_role?: string;
  branch_id?: string;
  method?: string;
  endpoint?: string;
  status_code?: number;
  request_body?: unknown;
  response_body?: unknown;
  success?: boolean;
  error_message?: string;
}

interface GetAuditLogsOptions {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  user_id?: string;
  tenant_id?: string;
  method?: string;
  user_role?: string;
  status_code?: number;
  success?: boolean;
  endpoint?: string;
  search?: string;
}

/**
 * Create an audit log
 */
export const createAuditLog = async (
  data: CreateAuditLogData
) => {
  const auditLog = await prisma.auditLog.create({
    data: {
      user_id: data.user_id,
      tenant_id: data.tenant_id,
      module: data.module,
      action: data.action,
      entity_name: data.entity_name,
      entity_id: data.entity_id,
      old_values: data.old_values as any,
      new_values: data.new_values as any,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      user_role: data.user_role,
      branch_id: data.branch_id,
      method: data.method,
      endpoint: data.endpoint,
      status_code: data.status_code,
      request_body: data.request_body as any,
      response_body: data.response_body as any,
      success: data.success,
      error_message: data.error_message,
    },
  });

  return auditLog;
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (
  options: GetAuditLogsOptions = {}
) => {
  const page = Math.max(options.page || 1, 1);

  const limit = Math.min(
    Math.max(options.limit || 20, 1),
    100
  );

  const skip = (page - 1) * limit;

  const where = {
    deleted_at: null,

    ...(options.module
      ? {
          module: {
            equals: options.module,
            mode: 'insensitive' as const,
          },
        }
      : {}),

    ...(options.action
      ? {
          action: {
            equals: options.action,
            mode: 'insensitive' as const,
          },
        }
      : {}),

    ...(options.user_id
      ? {
          user_id: options.user_id,
        }
      : {}),

    ...(options.tenant_id
      ? {
          tenant_id: options.tenant_id,
        }
      : {}),

    ...(options.method ? { method: { equals: options.method, mode: 'insensitive' as const } } : {}),
    ...(options.user_role ? { user_role: { equals: options.user_role, mode: 'insensitive' as const } } : {}),
    ...(options.status_code ? { status_code: options.status_code } : {}),
    ...(options.success !== undefined ? { success: options.success } : {}),
    ...(options.endpoint ? { endpoint: { contains: options.endpoint, mode: 'insensitive' as const } } : {}),
    ...(options.search ? { OR: [
      { endpoint: { contains: options.search, mode: 'insensitive' as const } },
      { action: { contains: options.search, mode: 'insensitive' as const } },
      { error_message: { contains: options.search, mode: 'insensitive' as const } },
      { user: { full_name: { contains: options.search, mode: 'insensitive' as const } } },
    ] } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,

      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },

        tenant: {
          select: {
            id: true,
            business_name: true,
          },
        },
      },

      orderBy: {
        created_at: 'desc',
      },
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get one audit log
 */
export const getAuditLogById = async (
  id: string
) => {
  const auditLog = await prisma.auditLog.findFirst({
    where: {
      id,
      deleted_at: null,
    },

    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },

      tenant: {
        select: {
          id: true,
          business_name: true,
        },
      },
    },
  });

  if (!auditLog) {
    throw new Error('Audit log not found');
  }

  return auditLog;
};

/**
 * Soft delete an audit log
 *
 * Super Admin only access is handled by middleware/controller.
 */
export const softDeleteAuditLog = async (
  id: string
) => {
  const existingLog = await prisma.auditLog.findFirst({
    where: {
      id,
    },
  });

  if (!existingLog) {
    throw new Error('Audit log not found');
  }

  const auditLog = await prisma.auditLog.delete({
    where: {
      id,
    },
  });

  return auditLog;
};