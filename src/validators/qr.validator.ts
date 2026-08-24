import { z } from 'zod';

export const generateQrSchema = z.object({
  table_id: z.string().uuid('Invalid table ID'),
});