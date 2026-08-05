import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { CouponModel } from '@/models/coupon.model';
import { api } from '@/lib/api-response';
import type { CouponType, CouponStatus, CouponAppliesTo } from '@/types';

const COUPON_TYPES: CouponType[] = ['percentage', 'fixed'];
const COUPON_STATUSES: CouponStatus[] = ['active', 'inactive', 'expired'];
const COUPON_APPLIES_TO: CouponAppliesTo[] = ['all', 'products', 'categories'];

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

/** Normalizes a coupon code to uppercase without surrounding whitespace. */
function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
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

function parseType(value: unknown): CouponType | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (COUPON_TYPES as string[]).includes(value)) {
    return value as CouponType;
  }
  return 'INVALID' as unknown as CouponType;
}

function parseStatus(value: unknown): CouponStatus | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (COUPON_STATUSES as string[]).includes(value)) {
    return value as CouponStatus;
  }
  return 'INVALID' as unknown as CouponStatus;
}

function parseAppliesTo(value: unknown): CouponAppliesTo | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (COUPON_APPLIES_TO as string[]).includes(value)) {
    return value as CouponAppliesTo;
  }
  return 'INVALID' as unknown as CouponAppliesTo;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { coupons, total } = await CouponModel.findPaginated(page, limit, {
      search,
      type,
      status,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(coupons, { page, limit, total, totalPages }, 'Coupons fetched');
  } catch (error) {
    console.error('Get coupons error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, code, type, value, appliesTo } = body;

    if (typeof name !== 'string' || !name.trim()) {
      return api.badRequest('Coupon name is required');
    }
    if (typeof code !== 'string' || !code.trim()) {
      return api.badRequest('Coupon code is required');
    }

    const parsedType = type === undefined || type === '' ? 'percentage' : parseType(type);
    if (parsedType === undefined || parsedType === ('INVALID' as unknown as CouponType)) {
      return api.badRequest('Invalid coupon type');
    }

    const valueNum = parseNumber(value);
    if (valueNum === undefined || valueNum <= 0) {
      return api.badRequest('A valid discount value is required');
    }
    if (parsedType === 'percentage' && valueNum > 100) {
      return api.badRequest('Percentage discount cannot exceed 100');
    }

    const existingCode = await CouponModel.findByCode(code.trim());
    if (existingCode) return api.conflict('A coupon with this code already exists');

    const minOrderAmount = parseNumber(body.minOrderAmount);
    if (minOrderAmount !== undefined && minOrderAmount < 0) {
      return api.badRequest('Minimum order amount cannot be negative');
    }
    const maxDiscountAmount = parseNumber(body.maxDiscountAmount);
    if (maxDiscountAmount !== undefined && maxDiscountAmount < 0) {
      return api.badRequest('Maximum discount cannot be negative');
    }
    const usageLimit = parseNumber(body.usageLimit);
    if (usageLimit !== undefined && (!Number.isInteger(usageLimit) || usageLimit < 1)) {
      return api.badRequest('Usage limit must be a positive integer');
    }
    const perUserLimit = parseNumber(body.perUserLimit);
    if (perUserLimit !== undefined && (!Number.isInteger(perUserLimit) || perUserLimit < 1)) {
      return api.badRequest('Per-user limit must be a positive integer');
    }

    const startDate = strOr(body.startDate) || undefined;
    const endDate = strOr(body.endDate) || undefined;
    if (startDate && endDate && Date.parse(endDate) <= Date.parse(startDate)) {
      return api.badRequest('End date must be after start date');
    }

    const parsedAppliesTo = appliesTo === undefined || appliesTo === '' ? 'all' : parseAppliesTo(appliesTo);
    if (parsedAppliesTo === undefined || parsedAppliesTo === ('INVALID' as unknown as CouponAppliesTo)) {
      return api.badRequest('Invalid applies-to scope');
    }

    const parsedStatus = body.status === undefined || body.status === '' ? 'active' : parseStatus(body.status);
    if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as CouponStatus)) {
      return api.badRequest('Invalid status');
    }

    const coupon = await CouponModel.create({
      name: name.trim(),
      code: normalizeCode(code),
      type: parsedType,
      value: valueNum,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      appliesTo: parsedAppliesTo,
      products: parseStringList(body.products),
      categories: parseStringList(body.categories),
      status: parsedStatus,
    });

    return api.created(coupon, 'Coupon created');
  } catch (error) {
    console.error('Create coupon error:', error);
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

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return api.badRequest('Coupon name cannot be empty');
      }
      updateData.name = body.name.trim();
    }

    if (body.code !== undefined) {
      if (typeof body.code !== 'string' || !body.code.trim()) {
        return api.badRequest('Coupon code cannot be empty');
      }
      const existingCode = await CouponModel.findByCode(body.code.trim());
      if (existingCode && existingCode._id !== _id) {
        return api.conflict('A coupon with this code already exists');
      }
      updateData.code = normalizeCode(body.code);
    }

    if (body.type !== undefined) {
      const parsedType = body.type === '' ? undefined : parseType(body.type);
      if (parsedType === undefined || parsedType === ('INVALID' as unknown as CouponType)) {
        return api.badRequest('Invalid coupon type');
      }
      updateData.type = parsedType;
    }

    if (body.value !== undefined) {
      const valueNum = parseNumber(body.value);
      if (valueNum === undefined || valueNum <= 0) {
        return api.badRequest('A valid discount value is required');
      }
      let effectiveType = updateData.type;
      if (effectiveType === undefined) {
        const existingCoupon = await CouponModel.findById(_id);
        if (existingCoupon) effectiveType = existingCoupon.type;
      }
      if (effectiveType === 'percentage' && valueNum > 100) {
        return api.badRequest('Percentage discount cannot exceed 100');
      }
      updateData.value = valueNum;
    }

    const optionalNumericFields: [string, string][] = [
      ['minOrderAmount', 'Minimum order amount cannot be negative'],
      ['maxDiscountAmount', 'Maximum discount cannot be negative'],
      ['usageLimit', 'Usage limit must be a positive integer'],
      ['perUserLimit', 'Per-user limit must be a positive integer'],
    ];

    for (const [field, message] of optionalNumericFields) {
      if (body[field] !== undefined) {
        const num = parseNumber(body[field]);
        if (num === undefined || num < 0) return api.badRequest(message);
        if ((field === 'usageLimit' || field === 'perUserLimit') && (!Number.isInteger(num) || num < 1)) {
          return api.badRequest(message);
        }
        updateData[field] = num;
      }
    }

    if (body.startDate !== undefined) updateData.startDate = strOr(body.startDate) || undefined;
    if (body.endDate !== undefined) updateData.endDate = strOr(body.endDate) || undefined;
    if (updateData.startDate && updateData.endDate && Date.parse(updateData.endDate) <= Date.parse(updateData.startDate)) {
      return api.badRequest('End date must be after start date');
    }

    if (body.appliesTo !== undefined) {
      const parsedAppliesTo = body.appliesTo === '' ? undefined : parseAppliesTo(body.appliesTo);
      if (parsedAppliesTo === undefined || parsedAppliesTo === ('INVALID' as unknown as CouponAppliesTo)) {
        return api.badRequest('Invalid applies-to scope');
      }
      updateData.appliesTo = parsedAppliesTo;
    }

    if (body.products !== undefined) updateData.products = parseStringList(body.products);
    if (body.categories !== undefined) updateData.categories = parseStringList(body.categories);

    if (body.status !== undefined) {
      const parsedStatus = body.status === '' ? undefined : parseStatus(body.status);
      if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as CouponStatus)) {
        return api.badRequest('Invalid status');
      }
      updateData.status = parsedStatus;
    }

    const updated = await CouponModel.update(_id, updateData);
    if (!updated) return api.notFound('Coupon not found');

    return api.ok(null, 'Coupon updated');
  } catch (error) {
    console.error('Update coupon error:', error);
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

    const deleted = await CouponModel.delete(_id);
    if (!deleted) return api.notFound('Coupon not found');

    return api.ok(null, 'Coupon deleted');
  } catch (error) {
    console.error('Delete coupon error:', error);
    return api.serverError();
  }
}
