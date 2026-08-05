import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { VariantModel } from '@/models/variant.model';
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

/** Normalises attributes from an object or a "Color: Black, Size: XL" string. */
function parseAttributes(value: unknown): Record<string, string> {
  if (!value) return {};
  if (typeof value === 'string') {
    const attrs: Record<string, string> = {};
    value.split(',').forEach((pair) => {
      const idx = pair.indexOf(':');
      if (idx > -1) {
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        if (key && val) attrs[key] = val;
      }
    });
    return attrs;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
        .map(([k, v]) => [k, String(v)])
    ) as Record<string, string>;
  }
  return {};
}

/** Coerces a value into a finite number, or undefined when empty/invalid. */
function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { variants, total } = await VariantModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(variants, { page, limit, total, totalPages }, 'Variants fetched');
  } catch (error) {
    console.error('Get variants error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { sku, attributes, price, salePrice, stock, image, weight } = body;

    if (typeof sku !== 'string' || !sku.trim()) {
      return api.badRequest('SKU is required');
    }

    const priceNum = parseNumber(price);
    if (priceNum === undefined || priceNum < 0) {
      return api.badRequest('A valid price is required');
    }

    const stockNum = parseNumber(stock);
    if (stockNum === undefined || stockNum < 0) {
      return api.badRequest('A valid stock quantity is required');
    }

    const existing = await VariantModel.findBySku(sku.trim());
    if (existing) return api.conflict('A variant with this SKU already exists');

    const salePriceNum = parseNumber(salePrice);
    if (salePriceNum !== undefined && salePriceNum < 0) {
      return api.badRequest('Sale price cannot be negative');
    }

    const weightNum = parseNumber(weight);

    const variant = await VariantModel.create({
      sku: sku.trim(),
      attributes: parseAttributes(attributes),
      price: priceNum,
      salePrice: salePriceNum,
      stock: stockNum,
      image: typeof image === 'string' ? image.trim() : '',
      weight: weightNum,
    });

    return api.created(variant, 'Variant created');
  } catch (error) {
    console.error('Create variant error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, sku, attributes, price, salePrice, stock, image, weight } = body;

    if (!_id) return api.badRequest('_id is required');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (sku !== undefined) {
      if (typeof sku !== 'string' || !sku.trim()) {
        return api.badRequest('SKU cannot be empty');
      }
      const existing = await VariantModel.findBySku(sku.trim());
      if (existing && existing._id !== _id) {
        return api.conflict('A variant with this SKU already exists');
      }
      updateData.sku = sku.trim();
    }

    if (attributes !== undefined) {
      updateData.attributes = parseAttributes(attributes);
    }

    if (price !== undefined) {
      const priceNum = parseNumber(price);
      if (priceNum === undefined || priceNum < 0) {
        return api.badRequest('A valid price is required');
      }
      updateData.price = priceNum;
    }

    if (salePrice !== undefined) {
      const salePriceNum = parseNumber(salePrice);
      if (salePriceNum !== undefined && salePriceNum < 0) {
        return api.badRequest('Sale price cannot be negative');
      }
      if (salePriceNum !== undefined) updateData.salePrice = salePriceNum;
    }

    if (stock !== undefined) {
      const stockNum = parseNumber(stock);
      if (stockNum === undefined || stockNum < 0) {
        return api.badRequest('A valid stock quantity is required');
      }
      updateData.stock = stockNum;
    }

    if (image !== undefined) {
      updateData.image = typeof image === 'string' ? image.trim() : '';
    }

    if (weight !== undefined) {
      const weightNum = parseNumber(weight);
      if (weightNum !== undefined) updateData.weight = weightNum;
    }

    const updated = await VariantModel.update(_id, updateData);
    if (!updated) return api.notFound('Variant not found');

    return api.ok(null, 'Variant updated');
  } catch (error) {
    console.error('Update variant error:', error);
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

    const deleted = await VariantModel.delete(_id);
    if (!deleted) return api.notFound('Variant not found');

    return api.ok(null, 'Variant deleted');
  } catch (error) {
    console.error('Delete variant error:', error);
    return api.serverError();
  }
}
