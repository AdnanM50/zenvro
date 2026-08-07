import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { InventoryModel } from '@/models/inventory.model';
import { ProductModel } from '@/models/product.model';
import { api } from '@/lib/api-response';

const MOVEMENT_TYPES = ['in', 'out', 'adjustment', 'return', 'damage'];

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

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
    const productId = searchParams.get('productId') || undefined;
    const variantSku = searchParams.get('variantSku') || undefined;
    const movementType = searchParams.get('movementType') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { items, total } = await InventoryModel.findPaginated(page, limit, {
      productId,
      variantSku,
      movementType,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(items, { page, limit, total, totalPages }, 'Inventory logs fetched');
  } catch (error) {
    console.error('Get inventory logs error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { productId, variantSku, quantity, movementType, note } = body;

    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return api.badRequest('productId is required');
    }

    const product = await ProductModel.findById(productId.trim());
    if (!product) {
      return api.notFound('Product not found');
    }

    if (variantSku) {
      if (typeof variantSku !== 'string') {
        return api.badRequest('variantSku must be a string');
      }
      const hasVariant = product.variants?.some((v) => v.sku === variantSku.trim());
      if (!hasVariant) {
        return api.notFound(`Variant with SKU "${variantSku}" not found on product`);
      }
    }

    const qtyNum = parseNumber(quantity);
    if (qtyNum === undefined || qtyNum === 0) {
      return api.badRequest('A non-zero quantity is required');
    }

    if (!movementType || !MOVEMENT_TYPES.includes(String(movementType))) {
      return api.badRequest('Invalid movementType. Must be one of: in, out, adjustment, return, damage');
    }

    const item = await InventoryModel.create({
      productId: productId.trim(),
      variantSku: variantSku ? String(variantSku).trim() : undefined,
      quantity: qtyNum,
      movementType: movementType as 'in' | 'out' | 'adjustment' | 'return' | 'damage',
      note: note || '',
    });

    return api.created(item, 'Inventory log recorded');
  } catch (error) {
    console.error('Create inventory log error:', error);
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

    const deleted = await InventoryModel.delete(_id);
    if (!deleted) return api.notFound('Inventory log not found');

    return api.ok(null, 'Inventory log deleted');
  } catch (error) {
    console.error('Delete inventory log error:', error);
    return api.serverError();
  }
}
