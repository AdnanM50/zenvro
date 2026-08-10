import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { SitemapModel } from '@/models/sitemap.model';
import { api } from '@/lib/api-response';

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
