import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { PageModel } from '@/models/page.model';
import { api } from '@/lib/api-response';
import { revalidatePublicPage } from '@/lib/revalidate-page';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!('admin' in auth)) return auth;

    // Ensure default CMS pages (About Us, Contact Us, Privacy Policy, Terms & Conditions) exist
    await PageModel.seedDefaults();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as 'published' | 'draft') || undefined;

    const pages = await PageModel.findAll({ search, status });
    return api.ok(pages, 'Pages fetched successfully');
  } catch (error) {
    console.error('Get CMS pages error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!('admin' in auth)) return auth;

    const body = await request.json();
    const { title, slug, status, sections, seo } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return api.badRequest('Page title is required');
    }

    if (status && !['published', 'draft'].includes(status)) {
      return api.badRequest('Status must be published or draft');
    }

    const page = await PageModel.create({
      title: title.trim(),
      slug: typeof slug === 'string' ? slug.trim() : undefined,
      status: status || 'published',
      sections: Array.isArray(sections) ? sections : [],
      seo: typeof seo === 'object' && seo !== null ? seo : undefined,
    });

    // Invalidate ISR cache for the page's public route so edits appear immediately
    await revalidatePublicPage(page.slug);

    return api.created(page, 'Page created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Create CMS page error:', error);
    if (message.includes('already in use')) {
      return api.badRequest(message);
    }
    return api.serverError();
  }
}
