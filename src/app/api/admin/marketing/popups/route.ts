import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { PopupBannerModel } from '@/models/popup-banner.model';
import { api } from '@/lib/api-response';
import type { PopupBannerStatus } from '@/types';

const POPUP_STATUSES: PopupBannerStatus[] = ['active', 'inactive'];

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

/** Coerces a value into a finite number, or undefined when empty/invalid. */
function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function strOr(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseStatus(value: unknown): PopupBannerStatus | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (POPUP_STATUSES as string[]).includes(value)) {
    return value as PopupBannerStatus;
  }
  return 'INVALID' as unknown as PopupBannerStatus;
}

function parseSortOrder(value: unknown): number | undefined {
  const n = parseNumber(value);
  if (n === undefined) return undefined;
  if (!Number.isInteger(n) || n < 0) return 'INVALID' as unknown as number;
  return n;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { banners, total } = await PopupBannerModel.findPaginated(page, limit, {
      search,
      status,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(banners, { page, limit, total, totalPages }, 'Popup banners fetched');
  } catch (error) {
    console.error('Get popup banners error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { title } = body;

    if (typeof title !== 'string' || !title.trim()) {
      return api.badRequest('Popup banner title is required');
    }

    const startDate = strOr(body.startDate) || undefined;
    const endDate = strOr(body.endDate) || undefined;
    if (startDate && endDate && Date.parse(endDate) <= Date.parse(startDate)) {
      return api.badRequest('End date must be after start date');
    }

    const parsedStatus = body.status === undefined || body.status === '' ? 'inactive' : parseStatus(body.status);
    if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as PopupBannerStatus)) {
      return api.badRequest('Invalid status');
    }

    const sortOrder = body.sortOrder === undefined || body.sortOrder === '' ? 0 : parseSortOrder(body.sortOrder);
    if (sortOrder === undefined || sortOrder === ('INVALID' as unknown as number)) {
      return api.badRequest('Sort order must be a non-negative integer');
    }

    const banner = await PopupBannerModel.create({
      title: title.trim(),
      description: strOr(body.description) || undefined,
      imageUrl: strOr(body.imageUrl) || undefined,
      buttonText: strOr(body.buttonText) || undefined,
      buttonLink: strOr(body.buttonLink) || undefined,
      startDate,
      endDate,
      status: parsedStatus,
      sortOrder,
    });

    return api.created(banner, 'Popup banner created');
  } catch (error) {
    console.error('Create popup banner error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id } = body;

    if (!_id) return api.badRequest('_id is required');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return api.badRequest('Popup banner title cannot be empty');
      }
      updateData.title = body.title.trim();
    }

    const optionalStringFields: string[] = ['description', 'imageUrl', 'buttonText', 'buttonLink'];
    for (const field of optionalStringFields) {
      if (body[field] !== undefined) {
        updateData[field] = strOr(body[field]) || undefined;
      }
    }

    if (body.startDate !== undefined) updateData.startDate = strOr(body.startDate) || undefined;
    if (body.endDate !== undefined) updateData.endDate = strOr(body.endDate) || undefined;
    if (updateData.startDate && updateData.endDate && Date.parse(updateData.endDate) <= Date.parse(updateData.startDate)) {
      return api.badRequest('End date must be after start date');
    }

    if (body.status !== undefined) {
      const parsedStatus = body.status === '' ? undefined : parseStatus(body.status);
      if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as PopupBannerStatus)) {
        return api.badRequest('Invalid status');
      }
      updateData.status = parsedStatus;
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = body.sortOrder === '' ? undefined : parseSortOrder(body.sortOrder);
      if (sortOrder === undefined || sortOrder === ('INVALID' as unknown as number)) {
        return api.badRequest('Sort order must be a non-negative integer');
      }
      updateData.sortOrder = sortOrder;
    }

    const updated = await PopupBannerModel.update(_id, updateData);
    if (!updated) return api.notFound('Popup banner not found');

    return api.ok(null, 'Popup banner updated');
  } catch (error) {
    console.error('Update popup banner error:', error);
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

    const deleted = await PopupBannerModel.delete(_id);
    if (!deleted) return api.notFound('Popup banner not found');

    return api.ok(null, 'Popup banner deleted');
  } catch (error) {
    console.error('Delete popup banner error:', error);
    return api.serverError();
  }
}
