import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { Coupon, CreateCouponPayload } from '@/types';

const COLLECTION = 'coupons';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

/** Normalizes a coupon code to uppercase without surrounding whitespace. */
function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

/** Coerces a value into a finite number, falling back to 0 for garbage input. */
function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Coerces a value into a finite number, or undefined when empty/invalid. */
function toFiniteOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export interface CouponFilters {
  search?: string;
  type?: string;
  status?: string;
}

function buildSearchFilter(search?: string): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [{ name: regex }, { code: regex }];
  }
  return filter;
}

function buildFilters(params: CouponFilters): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  const searchFilter = buildSearchFilter(params.search);
  if (searchFilter.$or) filter.$or = searchFilter.$or;

  if (params.type) filter.type = params.type;
  if (params.status) filter.status = params.status;

  return filter;
}

export const CouponModel = {
  async create(data: CreateCouponPayload): Promise<Coupon> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const coupon: Coupon = {
      _id,
      name: data.name,
      code: normalizeCode(data.code),
      type: data.type || 'percentage',
      value: toFiniteNumber(data.value),
      minOrderAmount: toFiniteOrUndefined(data.minOrderAmount),
      maxDiscountAmount: toFiniteOrUndefined(data.maxDiscountAmount),
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      usageLimit: toFiniteOrUndefined(data.usageLimit),
      perUserLimit: toFiniteOrUndefined(data.perUserLimit),
      usedCount: 0,
      appliesTo: data.appliesTo || 'all',
      products: data.products || [],
      categories: data.categories || [],
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(coupon);
    return coupon;
  },

  async findById(_id: string): Promise<Coupon | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findByCode(code: string): Promise<Coupon | null> {
    const c = await col();
    return c.findOne({ code: normalizeCode(code) });
  },

  async findAll(): Promise<Coupon[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    params: CouponFilters = {}
  ): Promise<{ coupons: Coupon[]; total: number }> {
    const c = await col();
    const filter = buildFilters(params);
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { coupons, total };
  },

  async update(_id: string, data: Partial<CreateCouponPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    if (data.code !== undefined) {
      updateFields.code = normalizeCode(data.code);
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
};
