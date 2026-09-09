import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { VariantModel } from '@/models/variant.model';
import { AttributeModel } from '@/models/attribute.model';
import { ProductModel } from '@/models/product.model';
import { api } from '@/lib/api-response';

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
        .map(([k, v]) => [k, String(v).trim()])
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
    const productId = searchParams.get('productId') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { variants, total } = await VariantModel.findPaginated(page, limit, search, productId);
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
    const { productId, sku, attributes, price, salePrice, costPrice, stock, image, weight, status } = body;

    if (typeof productId !== 'string' || !productId.trim()) {
      return api.badRequest('productId ObjectId reference is required');
    }

    const product = await ProductModel.findById(productId.trim());
    if (!product) {
      return api.notFound('Product not found for the given productId');
    }

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

    const existingSku = await VariantModel.findBySku(sku.trim());
    if (existingSku) return api.conflict('A variant with this SKU already exists');

    const parsedAttrs = parseAttributes(attributes);

    // Validate that only variant-enabled attributes (useForVariants: true) are used
    const allAttributes = await AttributeModel.findAll();
    const variantEnabledAttrs = new Map(
      allAttributes.filter((a) => a.useForVariants ?? a.isVariant ?? true).map((a) => [a.name.toLowerCase(), a])
    );

    for (const [attrName, attrValue] of Object.entries(parsedAttrs)) {
      const definedAttr = variantEnabledAttrs.get(attrName.toLowerCase());
      if (!definedAttr) {
        return api.badRequest(
          `Attribute "${attrName}" is either not defined or not enabled for variants (useForVariants must be true).`
        );
      }
      if (definedAttr.values.length > 0 && !definedAttr.values.includes(attrValue)) {
        return api.badRequest(
          `Value "${attrValue}" is invalid for attribute "${attrName}". Allowed values: ${definedAttr.values.join(', ')}`
        );
      }
    }

    const salePriceNum = parseNumber(salePrice);
    if (salePriceNum !== undefined && salePriceNum < 0) {
      return api.badRequest('Sale price cannot be negative');
    }

    const costPriceNum = parseNumber(costPrice);
    if (costPriceNum !== undefined && costPriceNum < 0) {
      return api.badRequest('Cost price cannot be negative');
    }

    const weightNum = parseNumber(weight);

    try {
      const variant = await VariantModel.create({
        productId: productId.trim(),
        sku: sku.trim(),
        attributes: parsedAttrs,
        price: priceNum,
        salePrice: salePriceNum,
        costPrice: costPriceNum,
        stock: stockNum,
        sold: 0,
        image: typeof image === 'string' ? image.trim() : '',
        weight: weightNum,
        status: status === 'inactive' ? 'inactive' : 'active',
      });

      return api.created(variant, 'Variant created');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('already exists for this product')) {
        return api.conflict(message);
      }
      throw err;
    }
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
    const { _id, productId, sku, attributes, price, salePrice, costPrice, stock, image, weight, status } = body;

    if (!_id) return api.badRequest('_id is required');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (productId !== undefined) {
      if (typeof productId !== 'string' || !productId.trim()) {
        return api.badRequest('productId cannot be empty');
      }
      updateData.productId = productId.trim();
    }

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
      const parsedAttrs = parseAttributes(attributes);
      const allAttributes = await AttributeModel.findAll();
      const variantEnabledAttrs = new Map(
        allAttributes.filter((a) => a.useForVariants ?? a.isVariant ?? true).map((a) => [a.name.toLowerCase(), a])
      );

      for (const [attrName, attrValue] of Object.entries(parsedAttrs)) {
        const definedAttr = variantEnabledAttrs.get(attrName.toLowerCase());
        if (!definedAttr) {
          return api.badRequest(
            `Attribute "${attrName}" is either not defined or not enabled for variants.`
          );
        }
        if (definedAttr.values.length > 0 && !definedAttr.values.includes(attrValue)) {
          return api.badRequest(
            `Value "${attrValue}" is invalid for attribute "${attrName}". Allowed values: ${definedAttr.values.join(', ')}`
          );
        }
      }

      updateData.attributes = parsedAttrs;
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

    if (costPrice !== undefined) {
      const costPriceNum = parseNumber(costPrice);
      if (costPriceNum !== undefined && costPriceNum < 0) {
        return api.badRequest('Cost price cannot be negative');
      }
      if (costPriceNum !== undefined) updateData.costPrice = costPriceNum;
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

    if (status !== undefined) {
      updateData.status = status === 'inactive' ? 'inactive' : 'active';
    }

    try {
      const updated = await VariantModel.update(_id, updateData);
      if (!updated) return api.notFound('Variant not found');

      return api.ok(null, 'Variant updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('already exists for this product')) {
        return api.conflict(message);
      }
      throw err;
    }
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
