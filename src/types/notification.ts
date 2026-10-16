export type NotificationType = 'order' | 'payment' | 'contact';

export interface AdminNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface NotificationResponse {
  notifications: AdminNotification[];
  unreadCount: number;
  totalCount: number;
}
