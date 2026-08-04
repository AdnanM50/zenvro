import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { TagModel } from '@/models/tag.model';
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

    const { tags, total } = await TagModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(tags, { page, limit, total, totalPages }, 'Tags fetched');
  } catch (error) {
    console.error('Get tags error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, slug } = body;

    if (!name) return api.badRequest('Name is required');

    const targetSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const existing = await TagModel.findBySlug(targetSlug);
    if (existing) return api.conflict('Tag with this slug already exists');

    const tag = await TagModel.create({ name, slug: targetSlug });
    return api.created(tag, 'Tag created');
  } catch (error) {
    console.error('Create tag error:', error);
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

    const updated = await TagModel.update(_id, updateData);
    if (!updated) return api.notFound('Tag not found');

    return api.ok(null, 'Tag updated');
  } catch (error) {
    console.error('Update tag error:', error);
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

    const deleted = await TagModel.delete(_id);
    if (!deleted) return api.notFound('Tag not found');

    return api.ok(null, 'Tag deleted');
  } catch (error) {
    console.error('Delete tag error:', error);
    return api.serverError();
  }
}
