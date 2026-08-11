import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { FlashSaleModel } from '@/models/flash-sale.model';
import { api } from '@/lib/api-response';
import type { FlashSaleDiscountType, FlashSaleStatus } from '@/types';

const DISCOUNT_TYPES: FlashSaleDiscountType[] = ['percentage', 'fixed'];
const FLASH_SALE_STATUSES: FlashSaleStatus[] = ['active', 'scheduled', 'ended', 'inactive'];

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

function parseDiscountType(value: unknown): FlashSaleDiscountType | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (DISCOUNT_TYPES as string[]).includes(value)) {
    return value as FlashSaleDiscountType;
  }
  return 'INVALID' as unknown as FlashSaleDiscountType;
}

function parseStatus(value: unknown): FlashSaleStatus | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (FLASH_SALE_STATUSES as string[]).includes(value)) {
    return value as FlashSaleStatus;
  }
  return 'INVALID' as unknown as FlashSaleStatus;
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

/** Validates a discount value against its type. Returns an error string or null. */
function validateDiscountValue(
  valueNum: number | undefined,
  effectiveType: FlashSaleDiscountType | undefined
): string | null {
  if (valueNum === undefined || valueNum <= 0) {
    return 'A valid discount value is required';
  }
  if (effectiveType === 'percentage' && valueNum > 100) {
    return 'Percentage discount cannot exceed 100';
  }
  return null;
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

    const { sales, total } = await FlashSaleModel.findPaginated(page, limit, {
      search,
      status,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(sales, { page, limit, total, totalPages }, 'Flash sales fetched');
  } catch (error) {
    console.error('Get flash sales error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { title, discountValue } = body;

    if (typeof title !== 'string' || !title.trim()) {
      return api.badRequest('Flash sale title is required');
    }

    const parsedType = body.discountType === undefined || body.discountType === '' ? 'percentage' : parseDiscountType(body.discountType);
    if (parsedType === undefined || parsedType === ('INVALID' as unknown as FlashSaleDiscountType)) {
      return api.badRequest('Invalid discount type');
    }

    const valueNum = parseNumber(discountValue);
    const valueError = validateDiscountValue(valueNum, parsedType);
    if (valueError) return api.badRequest(valueError);
    if (valueNum === undefined) return api.badRequest('A valid discount value is required');

    const startsAt = strOr(body.startsAt);
    const endsAt = strOr(body.endsAt);
    if (!startsAt) return api.badRequest('Start date is required');
    if (!endsAt) return api.badRequest('End date is required');
    if (Date.parse(endsAt) <= Date.parse(startsAt)) {
      return api.badRequest('End date must be after start date');
    }

    const parsedStatus = body.status === undefined || body.status === '' ? 'inactive' : parseStatus(body.status);
    if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as FlashSaleStatus)) {
      return api.badRequest('Invalid status');
    }

    const sortOrder = body.sortOrder === undefined || body.sortOrder === '' ? 0 : parseSortOrder(body.sortOrder);
    if (sortOrder === undefined || sortOrder === ('INVALID' as unknown as number)) {
      return api.badRequest('Sort order must be a non-negative integer');
    }

    const sale = await FlashSaleModel.create({
      title: title.trim(),
      description: strOr(body.description) || undefined,
      discountType: parsedType,
      discountValue: valueNum,
      startsAt,
      endsAt,
      productIds: parseStringList(body.productIds),
      showOnHome: parseBoolean(body.showOnHome),
      sortOrder,
      status: parsedStatus,
    });

    return api.created(sale, 'Flash sale created');
  } catch (error) {
    console.error('Create flash sale error:', error);
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
        return api.badRequest('Flash sale title cannot be empty');
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) updateData.description = strOr(body.description) || undefined;

    if (body.discountType !== undefined) {
      const parsedType = body.discountType === '' ? undefined : parseDiscountType(body.discountType);
      if (parsedType === undefined || parsedType === ('INVALID' as unknown as FlashSaleDiscountType)) {
        return api.badRequest('Invalid discount type');
      }
      updateData.discountType = parsedType;
    }

    if (body.discountValue !== undefined) {
      const valueNum = parseNumber(body.discountValue);
      let effectiveType = updateData.discountType;
      if (effectiveType === undefined) {
        const existingSale = await FlashSaleModel.findById(_id);
        if (existingSale) effectiveType = existingSale.discountType;
      }
      const valueError = validateDiscountValue(valueNum, effectiveType);
      if (valueError) return api.badRequest(valueError);
      updateData.discountValue = valueNum;
    }

    if (body.startsAt !== undefined) updateData.startsAt = strOr(body.startsAt);
    if (body.endsAt !== undefined) updateData.endsAt = strOr(body.endsAt);
    if (updateData.startsAt && updateData.endsAt && Date.parse(updateData.endsAt) <= Date.parse(updateData.startsAt)) {
      return api.badRequest('End date must be after start date');
    }

    if (body.productIds !== undefined) updateData.productIds = parseStringList(body.productIds);
    if (body.showOnHome !== undefined) updateData.showOnHome = parseBoolean(body.showOnHome);

    if (body.sortOrder !== undefined) {
      const sortOrder = body.sortOrder === '' ? undefined : parseSortOrder(body.sortOrder);
      if (sortOrder === undefined || sortOrder === ('INVALID' as unknown as number)) {
        return api.badRequest('Sort order must be a non-negative integer');
      }
      updateData.sortOrder = sortOrder;
    }

    if (body.status !== undefined) {
      const parsedStatus = body.status === '' ? undefined : parseStatus(body.status);
      if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as FlashSaleStatus)) {
        return api.badRequest('Invalid status');
      }
      updateData.status = parsedStatus;
    }

    const updated = await FlashSaleModel.update(_id, updateData);
    if (!updated) return api.notFound('Flash sale not found');

    return api.ok(null, 'Flash sale updated');
  } catch (error) {
    console.error('Update flash sale error:', error);
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

    const deleted = await FlashSaleModel.delete(_id);
    if (!deleted) return api.notFound('Flash sale not found');

    return api.ok(null, 'Flash sale deleted');
  } catch (error) {
    console.error('Delete flash sale error:', error);
    return api.serverError();
  }
}
