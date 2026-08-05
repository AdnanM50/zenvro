import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { Variant, CreateVariantPayload } from '@/types';

const COLLECTION = 'variants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

/** Coerces a value into a finite number, falling back to 0 for garbage input. */
function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildSearchFilter(search?: string): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [{ sku: regex }, { image: regex }];
  }
  return filter;
}

export const VariantModel = {
  async create(data: CreateVariantPayload): Promise<Variant> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const variant: Variant = {
      _id,
      sku: data.sku,
      attributes: data.attributes || {},
      price: toFiniteNumber(data.price),
      salePrice:
        data.salePrice === undefined || data.salePrice === null
          ? undefined
          : toFiniteNumber(data.salePrice),
      stock: toFiniteNumber(data.stock),
      image: data.image || '',
      weight:
        data.weight === undefined || data.weight === null
          ? undefined
          : toFiniteNumber(data.weight),
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(variant);
    return variant;
  },

  async findById(_id: string): Promise<Variant | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findBySku(sku: string): Promise<Variant | null> {
    const c = await col();
    return c.findOne({ sku });
  },

  async findAll(): Promise<Variant[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ variants: Variant[]; total: number }> {
    const c = await col();
    const filter = buildSearchFilter(search);
    const skip = (page - 1) * limit;
    const [variants, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { variants, total };
  },

  async update(_id: string, data: Partial<CreateVariantPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    if (data.attributes !== undefined) {
      updateFields.attributes = data.attributes;
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
