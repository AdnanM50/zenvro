import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { Tag, CreateTagPayload } from '@/types';

const COLLECTION = 'tags';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export const TagModel = {
  async create(data: CreateTagPayload): Promise<Tag> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const tag: Tag = {
      _id,
      name: data.name,
      slug: data.slug || slugify(data.name),
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(tag);
    return tag;
  },

  async findById(_id: string): Promise<Tag | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findBySlug(slug: string): Promise<Tag | null> {
    const c = await col();
    return c.findOne({ slug });
  },

  async findAll(): Promise<Tag[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ tags: Tag[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { slug: regex }];
    }
    const skip = (page - 1) * limit;
    const [tags, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { tags, total };
  },

  async update(_id: string, data: Partial<CreateTagPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    if (data.name && !data.slug) {
      updateFields.slug = slugify(data.name);
    }
    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },
};
