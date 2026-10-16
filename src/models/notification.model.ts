import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { AdminNotification, NotificationType } from '@/types/notification';

const COLLECTION = 'admin_notifications';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export const NotificationModel = {
  async create(data: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<AdminNotification> {
    const _id = generateObjectId();
    const now = new Date();

    const doc: AdminNotification = {
      _id,
      type: data.type,
      title: data.title.trim(),
      message: data.message.trim(),
      link: data.link || (data.type === 'order' ? '/admin/orders' : data.type === 'payment' ? '/admin/payment-history' : '/admin/contact'),
      isRead: false,
      metadata: data.metadata || {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      const c = await col();
      await c.insertOne(doc);
    } catch (err) {
      console.error('[NotificationModel.create] DB write error, continuing in memory:', err);
    }

    return doc;
  },

  async findRecent(limit = 40): Promise<AdminNotification[]> {
    try {
      const c = await col();
      const list = await c
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return list;
    } catch (err) {
      console.error('[NotificationModel.findRecent] error:', err);
      return [];
    }
  },

  async countUnread(): Promise<number> {
    try {
      const c = await col();
      return await c.countDocuments({ isRead: false });
    } catch (err) {
      console.error('[NotificationModel.countUnread] error:', err);
      return 0;
    }
  },

  async markAsRead(_id: string): Promise<boolean> {
    try {
      const c = await col();
      const res = await c.updateOne(
        { _id },
        { $set: { isRead: true, updatedAt: new Date().toISOString() } }
      );
      return res.modifiedCount > 0;
    } catch (err) {
      console.error('[NotificationModel.markAsRead] error:', err);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      const c = await col();
      await c.updateMany(
        { isRead: false },
        { $set: { isRead: true, updatedAt: new Date().toISOString() } }
      );
      return true;
    } catch (err) {
      console.error('[NotificationModel.markAllAsRead] error:', err);
      return false;
    }
  },

  async clearAll(): Promise<boolean> {
    try {
      const c = await col();
      await c.deleteMany({});
      return true;
    } catch (err) {
      console.error('[NotificationModel.clearAll] error:', err);
      return false;
    }
  },
};
