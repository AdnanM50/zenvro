import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { HomeSectionModel } from '@/models/home-section.model';
import { api } from '@/lib/api-response';
import type { HomeSectionType } from '@/types';

const SECTION_TYPES: HomeSectionType[] = ['featured-products', 'promo-banner', 'flash-sale', 'custom'];

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

/** Normalises an array or a comma-separated string into a clean string array. */
function parseStringList(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => strOr(v, '')).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseSectionType(value: unknown): HomeSectionType | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (SECTION_TYPES as string[]).includes(value)) {
    return value as HomeSectionType;
  }
  return 'INVALID' as unknown as HomeSectionType;
}

function parseSortOrder(value: unknown): number | undefined {
  const n = parseNumber(value);
  if (n === undefined) return undefined;
  if (!Number.isInteger(n) || n < 0) return 'INVALID' as unknown as number;
  return n;
}

function parseBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const sectionType = searchParams.get('sectionType') || undefined;
    const enabled = searchParams.get('enabled') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { sections, total } = await HomeSectionModel.findPaginated(page, limit, {
      search,
      sectionType,
      enabled,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(sections, { page, limit, total, totalPages }, 'Home sections fetched');
  } catch (error) {
    console.error('Get home sections error:', error);
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
      return api.badRequest('Home section title is required');
    }

    const parsedType = body.sectionType === undefined || body.sectionType === '' ? 'featured-products' : parseSectionType(body.sectionType);
    if (parsedType === undefined || parsedType === ('INVALID' as unknown as HomeSectionType)) {
      return api.badRequest('Invalid section type');
    }

    const sortOrder = body.sortOrder === undefined || body.sortOrder === '' ? 0 : parseSortOrder(body.sortOrder);
    if (sortOrder === undefined || sortOrder === ('INVALID' as unknown as number)) {
      return api.badRequest('Sort order must be a non-negative integer');
    }

    const section = await HomeSectionModel.create({
      title: title.trim(),
      subtitle: strOr(body.subtitle) || undefined,
      sectionType: parsedType,
      enabled: parseBoolean(body.enabled ?? true),
      sortOrder,
      productIds: parseStringList(body.productIds),
      imageUrl: strOr(body.imageUrl) || undefined,
      link: strOr(body.link) || undefined,
      linkText: strOr(body.linkText) || undefined,
      content: strOr(body.content) || undefined,
    });

    return api.created(section, 'Home section created');
  } catch (error) {
    console.error('Create home section error:', error);
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
        return api.badRequest('Home section title cannot be empty');
      }
      updateData.title = body.title.trim();
    }

    const optionalStringFields: string[] = ['subtitle', 'imageUrl', 'link', 'linkText', 'content'];
    for (const field of optionalStringFields) {
      if (body[field] !== undefined) {
        updateData[field] = strOr(body[field]) || undefined;
      }
    }

    if (body.sectionType !== undefined) {
      const parsedType = body.sectionType === '' ? undefined : parseSectionType(body.sectionType);
      if (parsedType === undefined || parsedType === ('INVALID' as unknown as HomeSectionType)) {
        return api.badRequest('Invalid section type');
      }
      updateData.sectionType = parsedType;
    }

    if (body.enabled !== undefined) updateData.enabled = parseBoolean(body.enabled);
    if (body.productIds !== undefined) updateData.productIds = parseStringList(body.productIds);

    if (body.sortOrder !== undefined) {
      const sortOrder = body.sortOrder === '' ? undefined : parseSortOrder(body.sortOrder);
      if (sortOrder === undefined || sortOrder === ('INVALID' as unknown as number)) {
        return api.badRequest('Sort order must be a non-negative integer');
      }
      updateData.sortOrder = sortOrder;
    }

    const updated = await HomeSectionModel.update(_id, updateData);
    if (!updated) return api.notFound('Home section not found');

    return api.ok(null, 'Home section updated');
  } catch (error) {
    console.error('Update home section error:', error);
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

    const deleted = await HomeSectionModel.delete(_id);
    if (!deleted) return api.notFound('Home section not found');

    return api.ok(null, 'Home section deleted');
  } catch (error) {
    console.error('Delete home section error:', error);
    return api.serverError();
  }
}
