import { NextRequest } from 'next/server';
import { PageModel } from '@/models/page.model';
import { api } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Ensure default CMS pages exist
    await PageModel.seedDefaults();

    const { slug } = await context.params;
    const page = await PageModel.findBySlug(slug);

    if (!page || page.status !== 'published') {
      return api.notFound('Page not found');
    }

    return api.ok(page, 'Page content fetched');
  } catch (error) {
    console.error('Public fetch page error:', error);
    return api.serverError();
  }
}
