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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!('admin' in auth)) return auth;

    const { id } = await context.params;
    const page = await PageModel.findById(id);
    if (!page) {
      return api.notFound('Page not found');
    }

    return api.ok(page, 'Page details fetched');
  } catch (error) {
    console.error('Get page by ID error:', error);
    return api.serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!('admin' in auth)) return auth;

    const { id } = await context.params;
    const body = await request.json();

    const updatedPage = await PageModel.update(id, body);
    if (!updatedPage) {
      return api.notFound('Page not found');
    }

    // Invalidate ISR cache for the page's public route so edits appear immediately
    await revalidatePublicPage(updatedPage.slug);

    return api.ok(updatedPage, 'Page updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Update page error:', error);
    if (message.includes('already in use')) {
      return api.badRequest(message);
    }
    return api.serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!('admin' in auth)) return auth;

    const { id } = await context.params;
    const page = await PageModel.findById(id);
    if (!page) {
      return api.notFound('Page not found');
    }

    const deleted = await PageModel.delete(id);
    if (!deleted) {
      return api.notFound('Page not found');
    }

    // Invalidate ISR cache for the deleted page's public route
    await revalidatePublicPage(page.slug);

    return api.ok(null, 'Page deleted successfully');
  } catch (error) {
    console.error('Delete page error:', error);
    return api.serverError();
  }
}
