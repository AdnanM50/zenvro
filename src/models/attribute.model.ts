import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { Attribute, CreateAttributePayload } from '@/types';

const COLLECTION = 'attributes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export const AttributeModel = {
  async create(data: CreateAttributePayload): Promise<Attribute> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const attr: Attribute = {
      _id,
      name: data.name,
      values: data.values || [],
      isVariant: data.isVariant ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(attr);
    return attr;
  },

  async findById(_id: string): Promise<Attribute | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findAll(): Promise<Attribute[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ attributes: Attribute[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { values: regex }];
    }
    const skip = (page - 1) * limit;
    const [attributes, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { attributes, total };
  },

  async update(_id: string, data: Partial<CreateAttributePayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },
};
