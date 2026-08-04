import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { CollectionModel } from '@/models/collection.model';
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
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { collections, total } = await CollectionModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(collections, { page, limit, total, totalPages }, 'Collections fetched');
  } catch (error) {
    console.error('Get collections error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, slug, banner, startDate, endDate, description, seo, isActive } = body;

    if (!name) return api.badRequest('Name is required');

    const targetSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const existing = await CollectionModel.findBySlug(targetSlug);
    if (existing) return api.conflict('Collection with this slug already exists');

    const collectionItem = await CollectionModel.create({
      name,
      slug: targetSlug,
      banner: banner || '',
      startDate: startDate || '',
      endDate: endDate || '',
      description: description || '',
      seo: seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
      isActive: isActive ?? true,
    });

    return api.created(collectionItem, 'Collection created');
  } catch (error) {
    console.error('Create collection error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) return api.badRequest('_id is required');

    const updated = await CollectionModel.update(_id, updateData);
    if (!updated) return api.notFound('Collection not found');

    return api.ok(null, 'Collection updated');
  } catch (error) {
    console.error('Update collection error:', error);
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

    const deleted = await CollectionModel.delete(_id);
    if (!deleted) return api.notFound('Collection not found');

    return api.ok(null, 'Collection deleted');
  } catch (error) {
    console.error('Delete collection error:', error);
    return api.serverError();
  }
}
