import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { SitemapModel } from '@/models/sitemap.model';
import { api } from '@/lib/api-response';
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') || undefined;

    const items = await SitemapModel.findAllItems(
      entityType ? { entityType } : undefined
    );
    return api.ok(items, 'Sitemap items fetched');
  } catch (error) {
    console.error('Get sitemap items error:', error);
    return api.serverError();
  }
}
