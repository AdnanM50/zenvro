import { NotificationModel } from '@/models/notification.model';
import { broadcastNotification } from './socket-server';
import type { AdminNotification, NotificationType } from '@/types/notification';

export interface DispatchNotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates a notification in the database and broadcasts it in real-time via Socket.IO
 */
export async function createAndDispatchNotification(
  payload: DispatchNotificationPayload
): Promise<AdminNotification> {
  // 1. Persist notification in DB
  const notification = await NotificationModel.create(payload);

  // 2. Broadcast via Socket.IO to connected admin clients
  await broadcastNotification(notification);

  return notification;
}
