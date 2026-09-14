import { NextRequest } from 'next/server';
import { CollectionModel } from '@/models/collection.model';
import { ProductModel } from '@/models/product.model';
import { api } from '@/lib/api-response';

/**
 * PUBLIC collections API endpoint (no auth required).
 *
 * Serves active collections from Collection Management.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const all = searchParams.get('all') === 'true';

    if (all || (!pageParam && !limitParam)) {
      let collections = await CollectionModel.findAll();
      collections = collections.filter((c) => c.isActive !== false);

      if (search) {
        const s = search.toLowerCase();
        collections = collections.filter(
          (c) => c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s)
        );
      }
      return api.ok(collections, 'Collections fetched successfully');
    }

    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10)));

    const { collections, total } = await CollectionModel.findPaginated(page, limit, search);
    const activeCollections = collections.filter((c) => c.isActive !== false);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(activeCollections, { page, limit, total, totalPages }, 'Collections fetched successfully');
  } catch (error) {
    console.error('Get public collections error:', error);
    return api.serverError('Failed to fetch collections');
  }
}
