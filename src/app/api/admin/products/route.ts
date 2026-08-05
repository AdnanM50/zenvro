import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ProductModel } from '@/models/product.model';
import { api } from '@/lib/api-response';
import { defaultProductSEO } from '@/types/product';
import type { ProductSEO, ProductStatus, ProductGender, CreateVariantPayload } from '@/types';

const PRODUCT_STATUSES: ProductStatus[] = ['draft', 'active', 'archived'];
const PRODUCT_GENDERS: ProductGender[] = ['men', 'women', 'unisex', 'kids', ''];

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Coerces a value into a finite number, or undefined when empty/invalid. */
function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseBooleanParam(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function strOr(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

/** Normalises an array or a comma-separated string into a clean string array. */
function parseStringList(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => strOr(v, '')).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Normalises specifications from an object or a "Color: Black, Size: XL" string. */
function parseSpecifications(value: unknown): Record<string, string> {
  if (!value) return {};
  if (typeof value === 'string') {
    const specs: Record<string, string> = {};
    value.split(',').forEach((pair) => {
      const idx = pair.indexOf(':');
      if (idx > -1) {
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        if (key && val) specs[key] = val;
      }
    });
    return specs;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
        .map(([k, v]) => [k, String(v)])
    ) as Record<string, string>;
  }
  return {};
}

/** Normalises an object or a "Color: Black" string into an attribute map. */
function parseAttributes(value: unknown): Record<string, string> {
  return parseSpecifications(value);
}

/** Merges raw seo input over the product defaults. */
function parseSEO(value: unknown): ProductSEO {
  const base = { ...defaultProductSEO };
  if (!value || typeof value !== 'object') return base;
  const src = value as Record<string, unknown>;
  return {
    title: strOr(src.title, base.title),
    description: strOr(src.description, base.description),
    keywords: parseStringList(src.keywords),
    canonical: strOr(src.canonical, base.canonical),
    ogImage: strOr(src.ogImage, base.ogImage),
    ogTitle: strOr(src.ogTitle, base.ogTitle),
    ogDescription: strOr(src.ogDescription, base.ogDescription),
    ogType: strOr(src.ogType, base.ogType),
    twitterCard: strOr(src.twitterCard, base.twitterCard),
    structuredData: strOr(src.structuredData, base.structuredData),
    robots: strOr(src.robots, base.robots),
  };
}

function parseStatus(value: unknown): ProductStatus | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (PRODUCT_STATUSES as string[]).includes(value)) {
    return value as ProductStatus;
  }
  return 'INVALID' as unknown as ProductStatus;
}

function parseGender(value: unknown): ProductGender | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (PRODUCT_GENDERS as string[]).includes(value)) {
    return value as ProductGender;
  }
  return 'INVALID' as unknown as ProductGender;
}

/**
 * Parses embedded variants from an array or a JSON string.
 * Returns normalized variant inputs or an error message.
 */
function parseVariants(value: unknown): {
  variants: CreateVariantPayload[];
  error?: string;
} {
  if (value === undefined || value === null) return { variants: [] };
  let list: unknown = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return { variants: [] };
    try {
      list = JSON.parse(trimmed);
    } catch {
      return { variants: [], error: 'Invalid variants JSON' };
    }
  }
  if (!Array.isArray(list)) return { variants: [], error: 'Variants must be an array' };

  const variants: CreateVariantPayload[] = [];
  for (const item of list) {
    if (typeof item !== 'object' || item === null) {
      return { variants: [], error: 'Each variant must be an object' };
    }
    const v = item as Record<string, unknown>;
    if (typeof v.sku !== 'string' || !v.sku.trim()) {
      return { variants: [], error: 'Each variant requires a SKU' };
    }
    const price = parseNumber(v.price);
    if (price === undefined || price < 0) {
      return { variants: [], error: 'Each variant requires a valid price' };
    }
    const stock = parseNumber(v.stock);
    if (stock === undefined || stock < 0) {
      return { variants: [], error: 'Each variant requires a valid stock quantity' };
    }
    const salePrice = parseNumber(v.salePrice);
    const weight = parseNumber(v.weight);
    variants.push({
      sku: v.sku.trim(),
      attributes: parseAttributes(v.attributes),
      price,
      salePrice: salePrice !== undefined && salePrice < 0 ? undefined : salePrice,
      stock,
      image: typeof v.image === 'string' ? v.image.trim() : '',
      weight: weight !== undefined && weight < 0 ? undefined : weight,
    });
  }
  return { variants };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const status = searchParams.get('status') || undefined;
    const gender = searchParams.get('gender') || undefined;
    const isFeatured = parseBooleanParam(searchParams.get('isFeatured'));
    const isNewArrival = parseBooleanParam(searchParams.get('isNewArrival'));
    const isTrending = parseBooleanParam(searchParams.get('isTrending'));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { products, total } = await ProductModel.findPaginated(page, limit, {
      search,
      category,
      brand,
      status,
      gender,
      isFeatured,
      isNewArrival,
      isTrending,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(products, { page, limit, total, totalPages }, 'Products fetched');
  } catch (error) {
    console.error('Get products error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, slug, sku, regularPrice, stock, salePrice, costPrice, lowStock, sold, status, gender } = body;

    if (typeof name !== 'string' || !name.trim()) {
      return api.badRequest('Product name is required');
    }
    if (typeof sku !== 'string' || !sku.trim()) {
      return api.badRequest('SKU is required');
    }

    const regularPriceNum = parseNumber(regularPrice);
    if (regularPriceNum === undefined || regularPriceNum < 0) {
      return api.badRequest('A valid regular price is required');
    }

    const stockNum = parseNumber(stock);
    if (stockNum === undefined || stockNum < 0) {
      return api.badRequest('A valid stock quantity is required');
    }

    const existingSku = await ProductModel.findBySku(sku.trim());
    if (existingSku) return api.conflict('A product with this SKU already exists');

    const candidateSlug = strOr(slug, '') || slugify(name);
    const existingSlug = await ProductModel.findBySlug(candidateSlug);
    if (existingSlug) return api.conflict('A product with this slug already exists');

    const salePriceNum = parseNumber(salePrice);
    if (salePriceNum !== undefined && salePriceNum < 0) {
      return api.badRequest('Sale price cannot be negative');
    }
    const costPriceNum = parseNumber(costPrice);
    if (costPriceNum !== undefined && costPriceNum < 0) {
      return api.badRequest('Cost price cannot be negative');
    }
    const lowStockNum = parseNumber(lowStock);
    if (lowStockNum !== undefined && lowStockNum < 0) {
      return api.badRequest('Low stock cannot be negative');
    }
    const soldNum = parseNumber(sold);
    if (soldNum !== undefined && soldNum < 0) {
      return api.badRequest('Sold count cannot be negative');
    }

    const parsedStatus = status === undefined || status === '' ? 'active' : parseStatus(status);
    if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as ProductStatus)) {
      return api.badRequest('Invalid status');
    }

    const parsedGender = gender === undefined || gender === '' ? '' : parseGender(gender);
    if (parsedGender === undefined || parsedGender === ('INVALID' as unknown as ProductGender)) {
      return api.badRequest('Invalid gender');
    }

    const { variants, error: variantsError } = parseVariants(body.variants);
    if (variantsError) return api.badRequest(variantsError);

    const product = await ProductModel.create({
      name: name.trim(),
      slug: candidateSlug,
      sku: sku.trim(),
      barcode: strOr(body.barcode),
      shortDescription: strOr(body.shortDescription),
      description: strOr(body.description),
      category: strOr(body.category),
      brand: strOr(body.brand),
      collection: strOr(body.collection),
      tags: parseStringList(body.tags),
      featuredImage: strOr(body.featuredImage),
      gallery: parseStringList(body.gallery),
      video: strOr(body.video),
      regularPrice: regularPriceNum,
      salePrice: salePriceNum ?? 0,
      costPrice: costPriceNum ?? 0,
      stock: stockNum,
      lowStock: lowStockNum ?? 0,
      sold: soldNum ?? 0,
      status: parsedStatus,
      isFeatured: parseBoolean(body.isFeatured) ?? false,
      isNewArrival: parseBoolean(body.isNewArrival) ?? false,
      isTrending: parseBoolean(body.isTrending) ?? false,
      gender: parsedGender,
      material: strOr(body.material),
      careInstruction: strOr(body.careInstruction),
      specifications: parseSpecifications(body.specifications),
      variants,
      seo: parseSEO(body.seo),
    });

    return api.created(product, 'Product created');
  } catch (error) {
    console.error('Create product error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, name, slug, sku } = body;

    if (!_id) return api.badRequest('_id is required');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return api.badRequest('Product name cannot be empty');
      }
      updateData.name = name.trim();
      if (slug === undefined) {
        const candidateSlug = slugify(name);
        const existingSlug = await ProductModel.findBySlug(candidateSlug);
        if (existingSlug && existingSlug._id !== _id) {
          return api.conflict('A product with this slug already exists');
        }
        updateData.slug = candidateSlug;
      }
    }

    if (slug !== undefined) {
      if (typeof slug !== 'string' || !slug.trim()) {
        return api.badRequest('Slug cannot be empty');
      }
      const existingSlug = await ProductModel.findBySlug(slug.trim());
      if (existingSlug && existingSlug._id !== _id) {
        return api.conflict('A product with this slug already exists');
      }
      updateData.slug = slug.trim();
    }

    if (sku !== undefined) {
      if (typeof sku !== 'string' || !sku.trim()) {
        return api.badRequest('SKU cannot be empty');
      }
      const existingSku = await ProductModel.findBySku(sku.trim());
      if (existingSku && existingSku._id !== _id) {
        return api.conflict('A product with this SKU already exists');
      }
      updateData.sku = sku.trim();
    }

    if (body.status !== undefined) {
      const parsedStatus = body.status === '' ? undefined : parseStatus(body.status);
      if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as ProductStatus)) {
        return api.badRequest('Invalid status');
      }
      updateData.status = parsedStatus;
    }

    if (body.gender !== undefined) {
      const parsedGender = body.gender === '' ? '' : parseGender(body.gender);
      if (parsedGender === undefined || parsedGender === ('INVALID' as unknown as ProductGender)) {
        return api.badRequest('Invalid gender');
      }
      updateData.gender = parsedGender;
    }

    const numericFields: [string, string][] = [
      ['regularPrice', 'A valid regular price is required'],
      ['salePrice', 'Sale price cannot be negative'],
      ['costPrice', 'Cost price cannot be negative'],
      ['stock', 'A valid stock quantity is required'],
      ['lowStock', 'Low stock cannot be negative'],
      ['sold', 'Sold count cannot be negative'],
    ];

    for (const [field, message] of numericFields) {
      if (body[field] !== undefined) {
        const num = parseNumber(body[field]);
        if (num === undefined || num < 0) {
          return api.badRequest(message);
        }
        updateData[field] = num;
      }
    }

    if (body.tags !== undefined) updateData.tags = parseStringList(body.tags);
    if (body.gallery !== undefined) updateData.gallery = parseStringList(body.gallery);
    if (body.specifications !== undefined) updateData.specifications = parseSpecifications(body.specifications);
    if (body.seo !== undefined) updateData.seo = parseSEO(body.seo);

    for (const field of ['barcode', 'shortDescription', 'description', 'category', 'brand', 'collection', 'featuredImage', 'video', 'material', 'careInstruction'] as const) {
      if (body[field] !== undefined) updateData[field] = strOr(body[field]);
    }

    for (const field of ['isFeatured', 'isNewArrival', 'isTrending'] as const) {
      if (body[field] !== undefined) updateData[field] = parseBoolean(body[field]) ?? false;
    }

    if (body.variants !== undefined) {
      const { variants, error: variantsError } = parseVariants(body.variants);
      if (variantsError) return api.badRequest(variantsError);
      updateData.variants = variants;
    }

    const updated = await ProductModel.update(_id, updateData);
    if (!updated) return api.notFound('Product not found');

    return api.ok(null, 'Product updated');
  } catch (error) {
    console.error('Update product error:', error);
    return api.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) return api.badRequest('_id is required');

    const deleted = await ProductModel.delete(_id);
    if (!deleted) return api.notFound('Product not found');

    return api.ok(null, 'Product deleted');
  } catch (error) {
    console.error('Delete product error:', error);
    return api.serverError();
  }
}
