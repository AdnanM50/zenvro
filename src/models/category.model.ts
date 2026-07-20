import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { deleteImages } from '@/lib/cloudinary';
import type { Category } from '@/types';

export type { Category } from '@/types';

const COLLECTION = 'categories';

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

/** Extract all image URLs from a category (image, seo.ogImage). */
function collectImages(cat: Category): (string | undefined)[] {
  return [cat.image, cat.seo?.ogImage];
}

export const CategoryModel = {
  async create(data: Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }): Promise<Category> {
    const c = await col();
    const _id = new ObjectId().toHexString();
    const now = new Date();
    const category: Category = {
      _id,
      slug: data.slug || slugify(data.name),
      ...data,
      seo: data.seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(category);
    return category;
  },

  async findById(_id: string): Promise<Category | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findBySlug(slug: string): Promise<Category | null> {
    const c = await col();
    return c.findOne({ slug });
  },

  async findAll(): Promise<Category[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findChildren(parentCategory: string): Promise<Category[]> {
    const c = await col();
    return c.find({ parentCategory }).sort({ createdAt: -1 }).toArray();
  },

  async update(_id: string, data: Partial<Omit<Category, '_id' | 'createdAt'>>): Promise<boolean> {
    const c = await col();

    // Fetch old category to detect changed images
    const old: Category | null = await c.findOne({ _id });
    if (!old) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    if (data.name && !data.slug) {
      updateFields.slug = slugify(data.name);
    }

    const result = await c.updateOne({ _id }, { $set: updateFields });
    if (result.modifiedCount === 0) return false;

    // Delete old images that were replaced
    const oldUrls = collectImages(old);
    const newUrls: (string | undefined)[] = [
      data.image !== undefined ? data.image : old.image,
      data.seo?.ogImage !== undefined ? data.seo.ogImage : old.seo?.ogImage,
    ];

    const removed = oldUrls.filter((url, i) => url && url !== newUrls[i]);
    if (removed.length > 0) {
      await deleteImages(removed);
    }

    return true;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();

    // Collect images from the category itself and all its children before deletion
    const cat: Category | null = await c.findOne({ _id });
    if (!cat) return false;

    const children: Category[] = await c.find({ parentCategory: _id }).toArray();
    const allImages = [
      ...collectImages(cat),
      ...children.flatMap(collectImages),
    ];

    // Delete from DB
    await c.deleteMany({ parentCategory: _id });
    const result = await c.deleteOne({ _id });

    // Delete images from Cloudinary (fire-and-forget, don't block)
    if (result.deletedCount > 0) {
      deleteImages(allImages).catch(() => {});
    }

    return result.deletedCount > 0;
  },

  async toggleActive(_id: string): Promise<boolean> {
    const c = await col();
    const cat = await c.findOne({ _id });
    if (!cat) return false;
    const result = await c.updateOne({ _id }, { $set: { isActive: !cat.isActive, updatedAt: new Date() } });
    return result.modifiedCount > 0;
  },

  async count(): Promise<number> {
    const c = await col();
    return c.countDocuments();
  },
};
