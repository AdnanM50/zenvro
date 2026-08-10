import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { RedirectModel } from '@/models/redirect.model';
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

    const { redirects, total } = await RedirectModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(redirects, { page, limit, total, totalPages }, 'Redirects fetched');
  } catch (error) {
    console.error('Get redirects error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { from, to, type, isActive } = body;

    if (!from || typeof from !== 'string' || !from.trim()) {
      return api.badRequest('"from" path is required');
    }
    if (!to || typeof to !== 'string' || !to.trim()) {
      return api.badRequest('"to" path is required');
    }
    if (from.trim() === to.trim()) {
      return api.badRequest('"from" and "to" cannot be the same');
    }

    const validTypes = [301, 302, 307, 308];
    if (type !== undefined && !validTypes.includes(type)) {
      return api.badRequest('type must be 301, 302, 307, or 308');
    }

    // Check for duplicate "from" path
    const existing = await RedirectModel.findByFrom(from.trim());
    if (existing) {
      return api.conflict(`A redirect from "${from.trim()}" already exists`);
    }

    const redirect = await RedirectModel.create({
      from: from.trim(),
      to: to.trim(),
      type: type || 301,
      isActive: isActive ?? true,
    });
    return api.created(redirect, 'Redirect created');
  } catch (error) {
    console.error('Create redirect error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, ...rest } = body;

    if (!_id) return api.badRequest('_id is required');

    const existing = await RedirectModel.findById(_id);
    if (!existing) return api.notFound('Redirect not found');

    const updateData: Record<string, unknown> = {};
    if ('from' in rest && typeof rest.from === 'string') updateData.from = rest.from.trim();
    if ('to' in rest && typeof rest.to === 'string') updateData.to = rest.to.trim();
    if ('type' in rest) {
      const validTypes = [301, 302, 307, 308];
      if (!validTypes.includes(rest.type)) {
        return api.badRequest('type must be 301, 302, 307, or 308');
      }
      updateData.type = rest.type;
    }
    if ('isActive' in rest) updateData.isActive = Boolean(rest.isActive);

    if (Object.keys(updateData).length === 0) {
      return api.badRequest('No update provided');
    }

    // Check from/to not the same
    const newFrom = (updateData.from as string) || existing.from;
    const newTo = (updateData.to as string) || existing.to;
    if (newFrom === newTo) {
      return api.badRequest('"from" and "to" cannot be the same');
    }

    await RedirectModel.update(_id, updateData);
    return api.ok(null, 'Redirect updated');
  } catch (error) {
    console.error('Update redirect error:', error);
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

    const deleted = await RedirectModel.delete(_id);
    if (!deleted) return api.notFound('Redirect not found');

    return api.ok(null, 'Redirect deleted');
  } catch (error) {
    console.error('Delete redirect error:', error);
    return api.serverError();
  }
}
