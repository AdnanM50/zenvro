import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { PopupBanner, CreatePopupBannerPayload } from '@/types';

const COLLECTION = 'popup-banners';

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

/** Coerces a value into a trimmed string, or undefined when empty. */
function strOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim();
}

export interface PopupBannerFilters {
  search?: string;
  status?: string;
}

function buildSearchFilter(search?: string): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [{ title: { $regex: search, $options: 'i' } }];
  }
  return filter;
}

function buildFilters(params: PopupBannerFilters): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  const searchFilter = buildSearchFilter(params.search);
  if (searchFilter.$or) filter.$or = searchFilter.$or;

  if (params.status) filter.status = params.status;

  return filter;
}

export const PopupBannerModel = {
  async create(data: CreatePopupBannerPayload): Promise<PopupBanner> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const banner: PopupBanner = {
      _id,
      title: strOrUndefined(data.title) || '',
      description: strOrUndefined(data.description),
      imageUrl: strOrUndefined(data.imageUrl),
      buttonText: strOrUndefined(data.buttonText),
      buttonLink: strOrUndefined(data.buttonLink),
      startDate: strOrUndefined(data.startDate),
      endDate: strOrUndefined(data.endDate),
      status: data.status || 'inactive',
      sortOrder: toFiniteNumber(data.sortOrder),
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(banner);
    return banner;
  },

  async findById(_id: string): Promise<PopupBanner | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findAll(): Promise<PopupBanner[]> {
    const c = await col();
    return c.find({}).sort({ sortOrder: 1, createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    params: PopupBannerFilters = {}
  ): Promise<{ banners: PopupBanner[]; total: number }> {
    const c = await col();
    const filter = buildFilters(params);
    const skip = (page - 1) * limit;
    const [banners, total] = await Promise.all([
      c.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { banners, total };
  },

  async update(_id: string, data: Partial<CreatePopupBannerPayload>): Promise<boolean> {
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

  async count(): Promise<number> {
    const c = await col();
    return c.countDocuments();
  },

  async countActive(): Promise<number> {
    const c = await col();
    return c.countDocuments({ status: 'active' });
  },
};
