import { NextRequest } from 'next/server';
import { TagModel } from '@/models/tag.model';
import { api } from '@/lib/api-response';

/**
 * PUBLIC tags endpoint (no auth required).
 *
 * Serves tags from Tags Management for public consumption.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const all = searchParams.get('all') === 'true';

    if (all || (!pageParam && !limitParam)) {
      let tags = await TagModel.findAll();
      if (search) {
        const s = search.toLowerCase();
        tags = tags.filter(
          (t) => t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s)
        );
      }
      return api.ok(tags, 'Tags fetched successfully');
    }

    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10)));

    const { tags, total } = await TagModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(tags, { page, limit, total, totalPages }, 'Tags fetched successfully');
  } catch (error) {
    console.error('Get public tags error:', error);
    return api.serverError('Failed to fetch tags');
  }
}
