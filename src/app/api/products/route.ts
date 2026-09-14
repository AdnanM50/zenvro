import { NextRequest } from 'next/server';
import { ProductModel } from '@/models/product.model';
import { CategoryModel } from '@/models/category.model';
import { TagModel } from '@/models/tag.model';
import { api } from '@/lib/api-response';
import { formatProductForUI } from '@/lib/products';
import type { ProductGender } from '@/types';

function parseBooleanParam(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/**
 * PUBLIC products API endpoint (no auth required).
 * Returns only products with status 'published'.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    let categoryParam = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const collection = searchParams.get('collection') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const genderParam = searchParams.get('gender') || undefined;
    const gender = genderParam ? (genderParam as ProductGender) : undefined;
    const isFeatured = parseBooleanParam(searchParams.get('isFeatured'));
    const isNewArrival = parseBooleanParam(searchParams.get('isNewArrival'));
    const isTrending = parseBooleanParam(searchParams.get('isTrending'));
    const sort = searchParams.get('sort') || 'featured';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    // Resolve Category Map
    let categoryMap: Record<string, string> = {};
    try {
      const allCategories = await CategoryModel.findAll();
      allCategories.forEach((cat) => {
        if (cat._id) {
          categoryMap[cat._id] = cat.name;
          categoryMap[cat._id.toLowerCase()] = cat.name;
        }
        if (cat.slug) {
          categoryMap[cat.slug] = cat.name;
          categoryMap[cat.slug.toLowerCase()] = cat.name;
        }
        if (cat.name) {
          categoryMap[cat.name] = cat.name;
          categoryMap[cat.name.toLowerCase()] = cat.name;
        }
      });

      if (categoryParam) {
        const matched = allCategories.find(
          (c) =>
            c._id === categoryParam ||
            c.name.toLowerCase() === categoryParam!.toLowerCase() ||
            c.slug.toLowerCase() === categoryParam!.toLowerCase()
        );
        if (matched) {
          categoryParam = { $in: [matched._id, matched.name, matched.slug] } as any;
        }
      }
    } catch (e) {
      console.error('Error fetching categories for map:', e);
    }

    // Resolve Tag Map
    let tagMap: Record<string, string> = {};
    try {
      const allTags = await TagModel.findAll();
      allTags.forEach((t) => {
        if (t._id) {
          tagMap[t._id] = t.name;
          tagMap[t._id.toLowerCase()] = t.name;
        }
        if (t.slug) {
          tagMap[t.slug] = t.name;
          tagMap[t.slug.toLowerCase()] = t.name;
        }
        if (t.name) {
          tagMap[t.name] = t.name;
          tagMap[t.name.toLowerCase()] = t.name;
        }
      });
    } catch (e) {
      console.error('Error fetching tags for map:', e);
    }

    const filters = {
      search,
      category: categoryParam,
      brand,
      collection,
      tag,
      gender,
      isFeatured,
      isNewArrival,
      isTrending,
      status: 'published' as const,
    };

    const { products, total } = await ProductModel.findPaginated(page, limit, filters);

    // Apply sorting
    let sorted = [...products];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    const formatted = sorted.map((p) => formatProductForUI(p, categoryMap, tagMap));
    const totalPages = Math.ceil(total / limit);

    return api.paginated(
      formatted,
      {
        page,
        limit,
        total,
        totalPages,
      },
      'Published products fetched successfully'
    );
  } catch (error) {
    console.error('Get public products error:', error);
    return api.serverError('Failed to fetch published products');
  }
}
