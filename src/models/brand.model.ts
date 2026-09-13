import { Schema, model, models } from 'mongoose';
import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import { paginateCollection } from './common';
import { validateCreateBrand, validateUpdateBrand } from '@/validations/brand.validation';
import type { Brand, CreateBrandPayload } from '@/types';

const COLLECTION = 'brands';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

/**
 * Clean Mongoose Schema definition for Brand entity
 */
export const brandSchema = new Schema<Brand>(
  {
    _id: { type: String, default: () => generateObjectId() },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: [{ type: String }],
      canonical: { type: String, default: '' },
      ogImage: { type: String, default: '' },
      robots: { type: String, default: 'index' },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

brandSchema.post<Brand>('save', function (doc: any, next) {
  if (doc) doc.__v = undefined;
  next();
});

export const BrandMongooseModel = models.Brand || model<Brand>('Brand', brandSchema);

export const BrandModel = {
  async create(data: CreateBrandPayload): Promise<Brand> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const validatedData = validateCreateBrand(data);

    const brand: Brand = {
      _id,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    };

    await c.insertOne(brand);
    return brand;
  },

  async findById(_id: string): Promise<Brand | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findBySlug(slug: string): Promise<Brand | null> {
    const c = await col();
    return c.findOne({ slug });
  },

  async findAll(): Promise<Brand[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ brands: Brand[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { slug: regex }];
    }
    const { items: brands, total } = await paginateCollection<Brand>(c, filter, { page, limit });
    return { brands, total };
  },

  async update(_id: string, data: Partial<CreateBrandPayload>): Promise<boolean> {
    const c = await col();
    const updateFields = validateUpdateBrand(data);
    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async toggleActive(_id: string): Promise<boolean> {
    const c = await col();
    const b = await c.findOne({ _id });
    if (!b) return false;
    const result = await c.updateOne({ _id }, { $set: { isActive: !b.isActive, updatedAt: new Date() } });
    return result.modifiedCount > 0;
  },
};
