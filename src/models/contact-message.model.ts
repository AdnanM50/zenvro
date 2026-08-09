import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type {
  ContactMessage,
  ContactMessageStats,
  CreateContactMessagePayload,
  UpdateContactMessagePayload,
  ContactMessageListParams,
} from '@/types/contact-message';

const COLLECTION = 'contact_messages';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export const ContactMessageModel = {
  async create(data: CreateContactMessagePayload): Promise<ContactMessage> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();

    const contactMessage: ContactMessage = {
      _id,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: (data.subject || '').trim(),
      message: data.message.trim(),
      userId: isString(data.userId) && data.userId.trim() ? data.userId.trim() : undefined,
      isRegistered: Boolean(data.isRegistered),
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };

    await c.insertOne(contactMessage);
    return contactMessage;
  },

  async findById(_id: string): Promise<ContactMessage | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findByEmail(email: string): Promise<ContactMessage[]> {
    const c = await col();
    return c.find({ email: email.trim().toLowerCase() }).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    params: ContactMessageListParams = {}
  ): Promise<{ messages: ContactMessage[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};

    if (params.search) {
      const regex = { $regex: params.search, $options: 'i' };
      filter.$or = [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }];
    }

    if (params.status) {
      filter.status = params.status;
    }

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);

    return { messages, total };
  },

  async update(
    _id: string,
    data: Partial<UpdateContactMessagePayload>,
    repliedBy?: string
  ): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { updatedAt: new Date() };

    if (data.status !== undefined) {
      if (!['new', 'answered'].includes(data.status)) {
        throw new Error('Status must be new or answered');
      }
      updateFields.status = data.status;
    }

    if (data.reply !== undefined) {
      if (!isString(data.reply) || !data.reply.trim()) {
        throw new Error('Reply cannot be empty');
      }
      updateFields.reply = data.reply.trim();
      updateFields.repliedAt = new Date();
      updateFields.repliedBy = repliedBy;
      updateFields.status = 'answered';
    }

    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async count(): Promise<number> {
    const c = await col();
    return c.countDocuments();
  },

  async countByStatus(): Promise<ContactMessageStats> {
    const c = await col();
    const [total, newCount, answeredCount, registeredCount, guestCount] = await Promise.all([
      c.countDocuments(),
      c.countDocuments({ status: 'new' }),
      c.countDocuments({ status: 'answered' }),
      c.countDocuments({ isRegistered: true }),
      c.countDocuments({ isRegistered: false }),
    ]);

    return {
      total,
      new: newCount,
      answered: answeredCount,
      registered: registeredCount,
      guest: guestCount,
    };
  },
};
