import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { ProductModel } from '@/models/product.model';
import { api } from '@/lib/api-response';
import { defaultProductSEO } from '@/types/product';
import type { ProductSEO, ProductStatus, ProductGender } from '@/types';

const PRODUCT_STATUSES: ProductStatus[] = ['draft', 'published', 'active', 'archived'];
const PRODUCT_GENDERS: ProductGender[] = ['men', 'women', 'unisex', 'kids', ''];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

function parseSEO(value: unknown): ProductSEO {
  const base = { ...defaultProductSEO };
  if (!value || typeof value !== 'object') return base;
  const src = value as Record<string, unknown>;
  const sitemapRaw = src.sitemap as Record<string, unknown> | undefined;
  return {
    title: strOr(src.title ?? src.seoTitle, base.title),
    description: strOr(src.description ?? src.metaDescription, base.description),
    focusKeyword: strOr(src.focusKeyword, base.focusKeyword),
    keywords: parseStringList(src.keywords ?? src.seoKeywords),
    canonical: strOr(src.canonical ?? src.canonicalUrl, base.canonical),
    robots: strOr(src.robots, base.robots),
    ogTitle: strOr(src.ogTitle, base.ogTitle),
    ogDescription: strOr(src.ogDescription, base.ogDescription),
    ogImage: strOr(src.ogImage, base.ogImage),
    twitterTitle: strOr(src.twitterTitle, base.twitterTitle),
    twitterDescription: strOr(src.twitterDescription, base.twitterDescription),
    twitterImage: strOr(src.twitterImage, base.twitterImage),
    sitemap: {
      include: sitemapRaw?.include !== undefined ? Boolean(sitemapRaw.include) : (base.sitemap?.include ?? true),
      priority: typeof sitemapRaw?.priority === 'number' ? sitemapRaw.priority : (base.sitemap?.priority ?? 0.8),
      changefreq: (typeof sitemapRaw?.changefreq === 'string' ? sitemapRaw.changefreq : (base.sitemap?.changefreq ?? 'weekly')) as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    },
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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const collection = searchParams.get('collection') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const statusParam = searchParams.get('status');
    const status = statusParam ? parseStatus(statusParam) : undefined;
    const genderParam = searchParams.get('gender');
    const gender = genderParam ? parseGender(genderParam) : undefined;
    const idsParam = searchParams.get('ids');
    const ids = idsParam
      ? idsParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    const isFeatured = parseBooleanParam(searchParams.get('isFeatured'));
    const isNewArrival = parseBooleanParam(searchParams.get('isNewArrival'));
    const isTrending = searchParams.get('isTrending') ? parseBooleanParam(searchParams.get('isTrending')) : undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { products, total } = await ProductModel.findPaginated(page, limit, {
      search,
      category,
      brand,
      collection,
      tag,
      status,
      gender,
      ids,
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
    const { name, slug, sku, category, brand, regularPrice, stock, salePrice, costPrice, lowStock, status, gender } = body;

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

    const parsedStatus = status === undefined || status === '' ? 'published' : parseStatus(status);
    if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as ProductStatus)) {
      return api.badRequest('Invalid status');
    }

    const parsedGender = gender === undefined || gender === '' ? '' : parseGender(gender);
    if (parsedGender === undefined || parsedGender === ('INVALID' as unknown as ProductGender)) {
      return api.badRequest('Invalid gender');
    }

    if (body.variants !== undefined) {
      let vList: unknown = body.variants;
      if (typeof body.variants === 'string') {
        try {
          vList = JSON.parse(body.variants);
        } catch {
          return api.badRequest('Invalid variants JSON');
        }
      }
      if (Array.isArray(vList)) {
        for (const item of vList) {
          if (typeof item === 'object' && item !== null) {
            const record = item as Record<string, unknown>;
            if (typeof record.sku !== 'string' || !record.sku.trim()) {
              return api.badRequest('Each variant requires a SKU');
            }
          }
        }
      }
    }

    const featuredImage = strOr(body.media?.featuredImage) || strOr(body.featuredImage);
    const gallery = body.media?.gallery ? parseStringList(body.media.gallery) : parseStringList(body.gallery);
    const video = strOr(body.media?.videoUrl) || strOr(body.video);

    const product = await ProductModel.create({
      name: name.trim(),
      slug: candidateSlug,
      sku: sku.trim(),
      barcode: strOr(body.barcode),
      shortDescription: strOr(body.shortDescription),
      description: strOr(body.description),
      category: strOr(category, 'general-cat'),
      brand: strOr(brand, 'general-brand'),
      collection: strOr(body.collection),
      tags: parseStringList(body.tags),
      featuredImage,
      gallery,
      video,
      media: {
        featuredImage,
        gallery,
        videoUrl: video,
      },
      regularPrice: regularPriceNum,
      salePrice: salePriceNum ?? 0,
      costPrice: costPriceNum ?? 0,
      stock: stockNum,
      lowStock: lowStockNum ?? 0,
      sold: 0,
      status: parsedStatus,
      isFeatured: parseBoolean(body.isFeatured) ?? false,
      isNewArrival: parseBoolean(body.isNewArrival) ?? false,
      isTrending: parseBoolean(body.isTrending) ?? false,
      gender: parsedGender,
      material: strOr(body.material),
      careInstruction: strOr(body.careInstruction),
      specifications: parseSpecifications(body.specifications),
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
    const { _id, name, slug, sku, category, brand } = body;

    if (!_id) return api.badRequest('_id is required');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) return api.badRequest('Name cannot be empty');
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      const candidate = strOr(slug) || (name ? slugify(name) : '');
      if (candidate) {
        const existing = await ProductModel.findBySlug(candidate);
        if (existing && existing._id !== _id) return api.conflict('A product with this slug already exists');
        updateData.slug = candidate;
      }
    } else if (name) {
      updateData.slug = slugify(name);
    }

    if (sku !== undefined) {
      if (typeof sku !== 'string' || !sku.trim()) return api.badRequest('SKU cannot be empty');
      const existing = await ProductModel.findBySku(sku.trim());
      if (existing && existing._id !== _id) return api.conflict('A product with this SKU already exists');
      updateData.sku = sku.trim();
    }

    if (category !== undefined) {
      if (!category || typeof category !== 'string' || !category.trim()) return api.badRequest('Category is required');
      updateData.category = category.trim();
    }

    if (brand !== undefined) {
      if (!brand || typeof brand !== 'string' || !brand.trim()) return api.badRequest('Brand is required');
      updateData.brand = brand.trim();
    }

    if (body.collection !== undefined) updateData.collection = strOr(body.collection);
    if (body.tags !== undefined) updateData.tags = parseStringList(body.tags);
    if (body.barcode !== undefined) updateData.barcode = strOr(body.barcode);
    if (body.shortDescription !== undefined) updateData.shortDescription = strOr(body.shortDescription);
    if (body.description !== undefined) updateData.description = strOr(body.description);

    if (body.regularPrice !== undefined) {
      const p = parseNumber(body.regularPrice);
      if (p === undefined || p < 0) return api.badRequest('A valid regular price is required');
      updateData.regularPrice = p;
    }

    if (body.salePrice !== undefined) {
      const p = parseNumber(body.salePrice);
      if (p !== undefined && p < 0) return api.badRequest('Invalid sale price');
      updateData.salePrice = p ?? 0;
    }

    if (body.costPrice !== undefined) {
      const p = parseNumber(body.costPrice);
      if (p !== undefined && p < 0) return api.badRequest('Invalid cost price');
      updateData.costPrice = p ?? 0;
    }

    if (body.stock !== undefined) {
      const s = parseNumber(body.stock);
      if (s === undefined || s < 0) return api.badRequest('Invalid stock quantity');
      updateData.stock = s;
    }

    if (body.lowStock !== undefined) {
      const s = parseNumber(body.lowStock);
      if (s !== undefined && s < 0) return api.badRequest('Invalid low stock');
      updateData.lowStock = s ?? 0;
    }

    if (body.status !== undefined) {
      const s = parseStatus(body.status);
      if (!s || s === ('INVALID' as unknown as ProductStatus)) return api.badRequest('Invalid status');
      updateData.status = s;
    }

    if (body.gender !== undefined) {
      const g = parseGender(body.gender);
      if (g === ('INVALID' as unknown as ProductGender)) return api.badRequest('Invalid gender');
      updateData.gender = g ?? '';
    }

    if (body.isFeatured !== undefined) updateData.isFeatured = parseBoolean(body.isFeatured);
    if (body.isNewArrival !== undefined) updateData.isNewArrival = parseBoolean(body.isNewArrival);
    if (body.isTrending !== undefined) updateData.isTrending = parseBoolean(body.isTrending);
    if (body.material !== undefined) updateData.material = strOr(body.material);
    if (body.careInstruction !== undefined) updateData.careInstruction = strOr(body.careInstruction);
    if (body.specifications !== undefined) updateData.specifications = parseSpecifications(body.specifications);
    if (body.seo !== undefined) updateData.seo = parseSEO(body.seo);

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
