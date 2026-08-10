import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { Redirect, CreateRedirectPayload } from '@/types';

const COLLECTION = 'redirects';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export const RedirectModel = {
  async create(data: CreateRedirectPayload): Promise<Redirect> {
    const c = await col();
    const _id = generateObjectId();
    const redirect: Redirect = {
      _id,
      from: data.from.trim(),
      to: data.to.trim(),
      type: data.type || 301,
      hits: 0,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
    };
    await c.insertOne(redirect);
    return redirect;
  },

  async findById(_id: string): Promise<Redirect | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findByFrom(from: string): Promise<Redirect | null> {
    const c = await col();
    return c.findOne({ from, isActive: true });
  },

  async findAll(): Promise<Redirect[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ redirects: Redirect[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ from: regex }, { to: regex }];
    }
    const skip = (page - 1) * limit;
    const [redirects, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { redirects, total };
  },

  async update(_id: string, data: Partial<Omit<Redirect, '_id' | 'createdAt' | 'hits'>>): Promise<boolean> {
    const c = await col();
    const result = await c.updateOne({ _id }, { $set: data });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async incrementHits(from: string): Promise<void> {
    const c = await col();
    await c.updateOne({ from, isActive: true }, { $inc: { hits: 1 } });
  },
};
