import { z } from 'zod';

export const createAuditLogSchema = z.object({
  user_id: z.string().uuid(),

  tenant_id: z
    .string()
    .uuid()
    .optional(),

  module: z
    .string()
    .min(1)
    .max(255),

  action: z
    .string()
    .min(1)
    .max(255),

  entity_name: z
    .string()
    .max(255)
    .optional(),

  entity_id: z
    .string()
    .uuid()
    .optional(),

  old_values: z
    .unknown()
    .optional(),

  new_values: z
    .unknown()
    .optional(),

  ip_address: z
    .string()
    .max(255)
    .optional(),

  user_agent: z
    .string()
    .optional(),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional(),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional(),

  module: z
    .string()
    .optional(),

  action: z
    .string()
    .optional(),

  user_id: z
    .string()
    .uuid()
    .optional(),

  tenant_id: z
    .string()
    .uuid()
    .optional(),
});