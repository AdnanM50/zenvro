import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { InventoryItem, CreateInventoryPayload, InventoryListParams } from '@/types/inventory';
import { ProductModel } from './product.model';

const COLLECTION = 'inventory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const InventoryModel = {
  async create(data: CreateInventoryPayload): Promise<InventoryItem> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const quantity = toFiniteNumber(data.quantity);

    const item: InventoryItem = {
      _id,
      productId: String(data.productId),
      variantSku: data.variantSku ? String(data.variantSku) : undefined,
      quantity,
      movementType: data.movementType,
      note: data.note ?? '',
      createdAt: now,
      updatedAt: now,
    };

    await c.insertOne(item);

    // Update Product / Variant stock level dynamically based on movement type
    let stockDelta = 0;
    if (data.movementType === 'in' || data.movementType === 'return') {
      stockDelta = Math.abs(quantity);
    } else if (data.movementType === 'out' || data.movementType === 'damage') {
      stockDelta = -Math.abs(quantity);
    } else if (data.movementType === 'adjustment') {
      stockDelta = quantity; // can be positive or negative
    }

    if (stockDelta !== 0) {
      const product = await ProductModel.findById(data.productId);
      if (product) {
        if (data.variantSku && product.variants && product.variants.length > 0) {
          const updatedVariants = product.variants.map((v) => {
            if (v.sku === data.variantSku) {
              const newVariantStock = Math.max(0, (v.stock || 0) + stockDelta);
              return { ...v, stock: newVariantStock };
            }
            return v;
          });
          const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
          await ProductModel.update(product._id, {
            variants: updatedVariants,
            stock: totalStock,
          });
        } else {
          const newProductStock = Math.max(0, (product.stock || 0) + stockDelta);
          await ProductModel.update(product._id, { stock: newProductStock });
        }
      }
    }

    return item;
  },

  async findById(_id: string): Promise<InventoryItem | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findPaginated(
    page: number,
    limit: number,
    params: InventoryListParams = {}
  ): Promise<{ items: InventoryItem[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};

    if (params.productId) {
      filter.productId = params.productId;
    }
    if (params.variantSku) {
      filter.variantSku = params.variantSku;
    }
    if (params.movementType) {
      filter.movementType = params.movementType;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);

    return { items, total };
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async count(): Promise<number> {
    const c = await col();
    return c.countDocuments();
  },
};
