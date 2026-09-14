import { NextRequest } from 'next/server';
import { CategoryModel } from '@/models/category.model';
import { api } from '@/lib/api-response';

/**
 * PUBLIC categories endpoint (no auth required).
 *
 * Exposes active categories from Category Management for public consumption.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const all = searchParams.get('all') === 'true';

    if (all || (!pageParam && !limitParam)) {
      let categories = await CategoryModel.findAll();
      categories = categories.filter((c) => c.isActive !== false);

      if (search) {
        const s = search.toLowerCase();
        categories = categories.filter(
          (c) => c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s)
        );
      }
      return api.ok(categories, 'Categories fetched successfully');
    }

    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10)));

    const { categories, total } = await CategoryModel.findPaginated(page, limit, search);
    const activeCategories = categories.filter((c) => c.isActive !== false);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(activeCategories, { page, limit, total, totalPages }, 'Categories fetched successfully');
  } catch (error) {
    console.error('Get public categories error:', error);
    return api.serverError('Failed to fetch categories');
  }
}
