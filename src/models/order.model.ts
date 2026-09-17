import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import type { Order, CreateOrderPayload } from '@/types';

const COLLECTION = 'orders';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

function generateOrderNumber(): string {
  const prefix = 'VL';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${random}`;
}

export const OrderModel = {
  async create(
    payload: CreateOrderPayload,
    userId?: string,
    userEmail?: string
  ): Promise<Order> {
    const c = await col();
    const now = new Date().toISOString();

    const subtotal = payload.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shipping = subtotal >= 300 || subtotal === 0 ? 0 : 15;
    const total = subtotal + shipping;

    const orderDoc: Omit<Order, '_id'> = {
      orderNumber: generateOrderNumber(),
      userId: userId || undefined,
      userEmail: userEmail || payload.shippingAddress.email || 'customer@velora.com',
      items: payload.items,
      subtotal,
      shipping,
      total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'confirmed',
      paymentIntentId: payload.paymentIntentId || undefined,
      shippingAddress: payload.shippingAddress,
      createdAt: now,
      updatedAt: now,
    };

    const result = await c.insertOne(orderDoc);
    return {
      _id: result.insertedId.toString(),
      ...orderDoc,
    };
  },

  async findById(id: string): Promise<Order | null> {
    const c = await col();
    let query: Record<string, unknown> = { orderNumber: id };

    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { orderNumber: id }] };
    }

    const doc = await c.findOne(query);
    if (!doc) return null;

    return {
      ...doc,
      _id: doc._id.toString(),
    } as Order;
  },

  async findByUser(email: string, userId?: string): Promise<Order[]> {
    const c = await col();
    const query = userId
      ? {
          $or: [
            { userEmail: email.toLowerCase().trim() },
            { userId: userId.toString() },
          ],
        }
      : { userEmail: email.toLowerCase().trim() };

    const docs = await c
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc: { _id: ObjectId; [key: string]: unknown }) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as Order[];
  },

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: Order['paymentStatus'],
    orderStatus?: Order['orderStatus'],
    paymentIntentId?: string
  ): Promise<Order | null> {
    const c = await col();
    let query: Record<string, unknown> = { orderNumber: orderId };
    if (ObjectId.isValid(orderId)) {
      query = { $or: [{ _id: new ObjectId(orderId) }, { orderNumber: orderId }] };
    }

    const update: Record<string, unknown> = {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    if (orderStatus) {
      update.orderStatus = orderStatus;
    }
    if (paymentIntentId) {
      update.paymentIntentId = paymentIntentId;
    }

    await c.updateOne(query, { $set: update });
    return this.findById(orderId);
  },

  async updateOrderStatus(
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ): Promise<Order | null> {
    const c = await col();
    let query: Record<string, unknown> = { orderNumber: orderId };
    if (ObjectId.isValid(orderId)) {
      query = { $or: [{ _id: new ObjectId(orderId) }, { orderNumber: orderId }] };
    }

    const update: Record<string, unknown> = {
      orderStatus,
      updatedAt: new Date().toISOString(),
    };
    if (paymentStatus) {
      update.paymentStatus = paymentStatus;
    }

    await c.updateOne(query, { $set: update });
    return this.findById(orderId);
  },

  async findAll(params?: {
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    try {
      const c = await col();
      const filter: Record<string, unknown> = {};

      if (params?.orderStatus && params.orderStatus !== 'all') {
        filter.orderStatus = params.orderStatus;
      }
      if (params?.paymentStatus && params.paymentStatus !== 'all') {
        filter.paymentStatus = params.paymentStatus;
      }
      if (params?.search) {
        const regex = new RegExp(params.search, 'i');
        filter.$or = [
          { orderNumber: regex },
          { userEmail: regex },
          { 'shippingAddress.fullName': regex },
          { 'shippingAddress.city': regex }
        ];
      }

      const page = params?.page || 1;
      const limit = params?.limit || 50;
      const skip = (page - 1) * limit;

      const [docs, total] = await Promise.all([
        c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
        c.countDocuments(filter)
      ]);

      const orders = docs.map((doc: { _id: ObjectId; [key: string]: unknown }) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as Order[];

      return { orders, total };
    } catch {
      return { orders: [], total: 0 };
    }
  },

  async delete(orderId: string): Promise<boolean> {
    try {
      const c = await col();
      let query: Record<string, unknown> = { orderNumber: orderId };
      if (ObjectId.isValid(orderId)) {
        query = { $or: [{ _id: new ObjectId(orderId) }, { orderNumber: orderId }] };
      }
      const res = await c.deleteOne(query);
      return res.deletedCount > 0;
    } catch {
      return false;
    }
  }
};

