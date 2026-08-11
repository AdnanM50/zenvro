import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { HomeSection, CreateHomeSectionPayload } from '@/types';

const COLLECTION = 'home-sections';

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

/** Normalises an array or a comma-separated string into a clean string array. */
function parseStringList(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export interface HomeSectionFilters {
  search?: string;
  sectionType?: string;
  enabled?: string;
}

function buildSearchFilter(search?: string): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [{ title: { $regex: search, $options: 'i' } }];
  }
  return filter;
}

function buildFilters(params: HomeSectionFilters): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  const searchFilter = buildSearchFilter(params.search);
  if (searchFilter.$or) filter.$or = searchFilter.$or;

  if (params.sectionType) filter.sectionType = params.sectionType;
  if (params.enabled !== undefined && params.enabled !== '') {
    filter.enabled = params.enabled === 'true';
  }

  return filter;
}

export const HomeSectionModel = {
  async create(data: CreateHomeSectionPayload): Promise<HomeSection> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const section: HomeSection = {
      _id,
      title: strOrUndefined(data.title) || '',
      subtitle: strOrUndefined(data.subtitle),
      sectionType: data.sectionType || 'featured-products',
      enabled: data.enabled ?? true,
      sortOrder: toFiniteNumber(data.sortOrder),
      productIds: parseStringList(data.productIds),
      imageUrl: strOrUndefined(data.imageUrl),
      link: strOrUndefined(data.link),
      linkText: strOrUndefined(data.linkText),
      content: strOrUndefined(data.content),
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(section);
    return section;
  },

  async findById(_id: string): Promise<HomeSection | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findAll(): Promise<HomeSection[]> {
    const c = await col();
    return c.find({}).sort({ sortOrder: 1, createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    params: HomeSectionFilters = {}
  ): Promise<{ sections: HomeSection[]; total: number }> {
    const c = await col();
    const filter = buildFilters(params);
    const skip = (page - 1) * limit;
    const [sections, total] = await Promise.all([
      c.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { sections, total };
  },

  async update(_id: string, data: Partial<CreateHomeSectionPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    if (data.productIds !== undefined) {
      updateFields.productIds = parseStringList(data.productIds);
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

  async countEnabled(): Promise<number> {
    const c = await col();
    return c.countDocuments({ enabled: true });
  },
};
