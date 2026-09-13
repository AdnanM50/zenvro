import type { CreateVariantPayload, UpdateVariantPayload } from '@/types/variant';
import { sanitizeString, sanitizeNumber } from './common.validation';

export function validateCreateVariant(data: CreateVariantPayload) {
  if (!data.productId || !String(data.productId).trim()) {
    throw new Error('Parent product ID (productId) is required');
  }

  const sku = sanitizeString(data.sku);
  if (!sku) throw new Error('Variant SKU is required');

  const price = sanitizeNumber(data.price, 0, 0);

  let formattedAttributes: Array<{ attributeId: string; attributeName?: string; value: string }> = [];
  if (Array.isArray(data.attributes)) {
    formattedAttributes = data.attributes.map((attr) => ({
      attributeId: String(attr.attributeId).trim(),
      attributeName: attr.attributeName ? String(attr.attributeName).trim() : undefined,
      value: String(attr.value).trim(),
    }));
  } else if (data.attributes && typeof data.attributes === 'object') {
    formattedAttributes = Object.entries(data.attributes).map(([key, val]) => ({
      attributeId: key,
      attributeName: key,
      value: String(val).trim(),
    }));
  }

  return {
    productId: String(data.productId).trim(),
    sku,
    price,
    salePrice: data.salePrice !== undefined ? sanitizeNumber(data.salePrice, 0, 0) : undefined,
    costPrice: data.costPrice !== undefined ? sanitizeNumber(data.costPrice, 0, 0) : undefined,
    stock: sanitizeNumber(data.stock, 0, 0),
    sold: 0,
    attributes: formattedAttributes,
    image: sanitizeString(data.image, ''),
    weight: data.weight !== undefined ? sanitizeNumber(data.weight, 0, 0) : undefined,
    status: data.status || 'active',
  };
}

export function validateUpdateVariant(data: Partial<UpdateVariantPayload>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = { updatedAt: new Date() };

  if (data.productId !== undefined) {
    if (!String(data.productId).trim()) {
      throw new Error('Parent product ID (productId) cannot be empty');
    }
    updateFields.productId = String(data.productId).trim();
  }

  if (data.sku !== undefined) updateFields.sku = sanitizeString(data.sku);
  if (data.price !== undefined) updateFields.price = sanitizeNumber(data.price, 0, 0);
  if (data.salePrice !== undefined) updateFields.salePrice = sanitizeNumber(data.salePrice, 0, 0);
  if (data.costPrice !== undefined) updateFields.costPrice = sanitizeNumber(data.costPrice, 0, 0);
  if (data.stock !== undefined) updateFields.stock = sanitizeNumber(data.stock, 0, 0);

  if (data.attributes !== undefined) {
    if (Array.isArray(data.attributes)) {
      updateFields.attributes = data.attributes.map((attr) => ({
        attributeId: String(attr.attributeId).trim(),
        attributeName: attr.attributeName ? String(attr.attributeName).trim() : undefined,
        value: String(attr.value).trim(),
      }));
    } else if (data.attributes && typeof data.attributes === 'object') {
      updateFields.attributes = Object.entries(data.attributes).map(([key, val]) => ({
        attributeId: key,
        attributeName: key,
        value: String(val).trim(),
      }));
    }
  }

  if (data.image !== undefined) updateFields.image = sanitizeString(data.image);
  if (data.weight !== undefined) updateFields.weight = sanitizeNumber(data.weight, 0, 0);
  if (data.status !== undefined) updateFields.status = data.status;

  return updateFields;
}
