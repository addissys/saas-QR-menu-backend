import { z } from 'zod';

export const createNotificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),

  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters'),

  message: z
    .string()
    .min(1, 'Message is required'),

  type: z.enum([
    'SYSTEM',
    'SUBSCRIPTION',
    'BRANCH',
    'MENU',
    'PROMOTION',
    'ALERT',
  ]),
});

export const notificationIdSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export type CreateNotificationInput = z.infer<
  typeof createNotificationSchema
>;