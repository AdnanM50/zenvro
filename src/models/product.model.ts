import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type {
  Product,
  CreateProductPayload,
  ProductSEO,
  Variant,
  CreateVariantPayload,
} from '@/types';

const COLLECTION = 'products';

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

function defaultSEO(): ProductSEO {
  return {
    title: '',
    description: '',
    keywords: [],
    canonical: '',
    ogImage: '',
    ogTitle: '',
    ogDescription: '',
    ogType: 'product',
    twitterCard: 'summary_large_image',
    structuredData: '',
    robots: 'index',
  };
}

/** Hydrates an embedded variant with an id and timestamps. */
function hydrateVariant(input: CreateVariantPayload): Variant {
  const now = new Date();
  return {
    _id: generateObjectId(),
    sku: input.sku,
    attributes: input.attributes || {},
    price: toFiniteNumber(input.price),
    salePrice: toFiniteOrUndefined(input.salePrice),
    stock: toFiniteNumber(input.stock),
    image: input.image || '',
    weight: toFiniteOrUndefined(input.weight),
    createdAt: now,
    updatedAt: now,
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
  gender?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
}

function buildSearchFilter(search?: string): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [{ name: regex }, { sku: regex }, { barcode: regex }];
  }
  return filter;
}

function buildFilters(params: ProductFilters): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  const searchFilter = buildSearchFilter(params.search);
  if (searchFilter.$or) filter.$or = searchFilter.$or;

  if (params.category) filter.category = params.category;
  if (params.brand) filter.brand = params.brand;
  if (params.status) filter.status = params.status;
  if (params.gender) filter.gender = params.gender;
  if (params.isFeatured !== undefined) filter.isFeatured = params.isFeatured;
  if (params.isNewArrival !== undefined) filter.isNewArrival = params.isNewArrival;
  if (params.isTrending !== undefined) filter.isTrending = params.isTrending;

  return filter;
}

export const ProductModel = {
  async create(data: CreateProductPayload): Promise<Product> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const product: Product = {
      _id,
      name: data.name,
      slug: data.slug || slugify(data.name),
      sku: data.sku,
      barcode: data.barcode || '',
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      category: data.category || '',
      brand: data.brand || '',
      collection: data.collection || '',
      tags: data.tags || [],
      featuredImage: data.featuredImage || '',
      gallery: data.gallery || [],
      video: data.video || '',
      regularPrice: toFiniteNumber(data.regularPrice),
      salePrice: toFiniteOrUndefined(data.salePrice) ?? 0,
      costPrice: toFiniteOrUndefined(data.costPrice) ?? 0,
      stock: toFiniteNumber(data.stock),
      lowStock: toFiniteOrUndefined(data.lowStock) ?? 0,
      sold: toFiniteOrUndefined(data.sold) ?? 0,
      status: data.status || 'active',
      isFeatured: data.isFeatured ?? false,
      isNewArrival: data.isNewArrival ?? false,
      isTrending: data.isTrending ?? false,
      gender: data.gender || '',
      material: data.material || '',
      careInstruction: data.careInstruction || '',
      specifications: data.specifications || {},
      variants: (data.variants || []).map(hydrateVariant),
      seo: { ...defaultSEO(), ...(data.seo || {}) },
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(product);
    return product;
  },

  async findById(_id: string): Promise<Product | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findBySlug(slug: string): Promise<Product | null> {
    const c = await col();
    return c.findOne({ slug });
  },

  async findBySku(sku: string): Promise<Product | null> {
    const c = await col();
    return c.findOne({ sku });
  },

  async findAll(): Promise<Product[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    params: ProductFilters = {}
  ): Promise<{ products: Product[]; total: number }> {
    const c = await col();
    const filter = buildFilters(params);
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { products, total };
  },

  async update(_id: string, data: Partial<CreateProductPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    if (data.name && !data.slug) {
      updateFields.slug = slugify(data.name);
    }
    if (data.variants !== undefined) {
      updateFields.variants = data.variants.map(hydrateVariant);
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
