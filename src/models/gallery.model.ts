import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { GalleryItem, CreateGalleryPayload } from '@/types';

const COLLECTION = 'gallery';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export const GalleryModel = {
  async create(data: CreateGalleryPayload): Promise<GalleryItem> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const item: GalleryItem = {
      _id,
      url: data.url,
      publicId: data.publicId || undefined,
      title: data.title || '',
      altText: data.altText || '',
      mimeType: data.mimeType || '',
      size: data.size,
      width: data.width,
      height: data.height,
      source: data.source || 'url',
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(item);
    return item;
  },

  async findById(_id: string): Promise<GalleryItem | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findAll(): Promise<GalleryItem[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ items: GalleryItem[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ title: regex }, { altText: regex }, { url: regex }];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { items, total };
  },

  async update(_id: string, data: Partial<CreateGalleryPayload>): Promise<boolean> {
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
