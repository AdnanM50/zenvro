import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { GalleryModel } from '@/models/gallery.model';
import { deleteImage } from '@/lib/cloudinary';
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

function isValidImageUrl(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { items, total } = await GalleryModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(items, { page, limit, total, totalPages }, 'Gallery items fetched');
  } catch (error) {
    console.error('Get gallery items error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { url, publicId, title, altText, mimeType, size, width, height, source } = body;

    if (!isValidImageUrl(url)) {
      return api.badRequest('A valid image URL is required (http or https)');
    }

    const item = await GalleryModel.create({
      url: url.trim(),
      publicId: typeof publicId === 'string' && publicId ? publicId : undefined,
      title: typeof title === 'string' ? title.trim() : '',
      altText: typeof altText === 'string' ? altText.trim() : '',
      mimeType: typeof mimeType === 'string' ? mimeType : '',
      size: typeof size === 'number' && size >= 0 ? size : undefined,
      width: typeof width === 'number' && width > 0 ? width : undefined,
      height: typeof height === 'number' && height > 0 ? height : undefined,
      source: source === 'upload' ? 'upload' : 'url',
    });

    return api.created(item, 'Image added to gallery');
  } catch (error) {
    console.error('Create gallery item error:', error);
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

    const updateData: Record<string, unknown> = {};

    if ('url' in rest) {
      if (!isValidImageUrl(rest.url)) {
        return api.badRequest('A valid image URL is required (http or https)');
      }
      updateData.url = String(rest.url).trim();
    }
    if ('title' in rest) updateData.title = typeof rest.title === 'string' ? rest.title.trim() : '';
    if ('altText' in rest) updateData.altText = typeof rest.altText === 'string' ? rest.altText.trim() : '';
    if ('mimeType' in rest) updateData.mimeType = typeof rest.mimeType === 'string' ? rest.mimeType : '';
    if ('source' in rest) updateData.source = rest.source === 'upload' ? 'upload' : 'url';
    if ('publicId' in rest) {
      updateData.publicId = typeof rest.publicId === 'string' && rest.publicId ? rest.publicId : undefined;
    }
    if ('size' in rest) updateData.size = typeof rest.size === 'number' && rest.size >= 0 ? rest.size : undefined;
    if ('width' in rest) updateData.width = typeof rest.width === 'number' && rest.width > 0 ? rest.width : undefined;
    if ('height' in rest) updateData.height = typeof rest.height === 'number' && rest.height > 0 ? rest.height : undefined;

    const updated = await GalleryModel.update(_id, updateData);
    if (!updated) return api.notFound('Gallery item not found');

    return api.ok(null, 'Gallery item updated');
  } catch (error) {
    console.error('Update gallery item error:', error);
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

    const item = await GalleryModel.findById(_id);
    if (!item) return api.notFound('Gallery item not found');

    if (item.publicId) {
      await deleteImage(item.publicId);
    }

    await GalleryModel.delete(_id);

    return api.ok(null, 'Gallery item deleted');
  } catch (error) {
    console.error('Delete gallery item error:', error);
    return api.serverError();
  }
}
