import { Schema, model, models } from 'mongoose';
import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import { paginateCollection } from './common';
import { validateCreateTag, validateUpdateTag } from '@/validations/tag.validation';
import type { Tag, CreateTagPayload } from '@/types';

const COLLECTION = 'tags';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

/**
 * Clean Mongoose Schema definition for Tag entity
 */
export const tagSchema = new Schema<Tag>(
  {
    _id: { type: String, default: () => generateObjectId() },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
  },
  {
    timestamps: true,
  }
);

tagSchema.post<Tag>('save', function (doc: any, next) {
  if (doc) doc.__v = undefined;
  next();
});

export const TagMongooseModel = models.Tag || model<Tag>('Tag', tagSchema);

export const TagModel = {
  async create(data: CreateTagPayload): Promise<Tag> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const validatedData = validateCreateTag(data);

    const tag: Tag = {
      _id,
      ...validatedData,
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
    const { items: tags, total } = await paginateCollection<Tag>(c, filter, { page, limit });
    return { tags, total };
  },

  async update(_id: string, data: Partial<CreateTagPayload>): Promise<boolean> {
    const c = await col();
    const updateFields = validateUpdateTag(data);
    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },
};
