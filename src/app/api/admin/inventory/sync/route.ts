import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { ProductMongooseModel } from '@/models/product.model';
import { VariantMongooseModel } from '@/models/variant.model';
import connectToDatabase from '@/lib/mongoose';
import { api } from '@/lib/api-response';

interface SyncOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    await connectToDatabase();
    const body = await request.json();
    const { items } = body as { items?: SyncOrderItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return api.badRequest('Items array is required');
    }

    const updatedItems = [];

    for (const item of items) {
      const { productId, variantId, quantity } = item;
      const qty = Math.max(1, Number(quantity) || 1);

      let variantUpdated = false;
      if (variantId) {
        const variant = await VariantMongooseModel.findById(variantId).exec();
        if (variant) {
          variant.stock = Math.max(0, variant.stock - qty);
          variant.sold = (variant.sold || 0) + qty;
          await variant.save();
          variantUpdated = true;
        }
      }

      let productUpdated = false;
      if (productId) {
        const product = await ProductMongooseModel.findById(productId).exec();
        if (product) {
          product.stock = Math.max(0, product.stock - qty);
          product.sold = (product.sold || 0) + qty;
          await product.save();
          productUpdated = true;
        }
      }

      updatedItems.push({
        productId,
        variantId,
        quantity: qty,
        productUpdated,
        variantUpdated,
      });
    }

    return api.ok({ updatedItems }, 'Inventory synchronized for completed order');
  } catch (error) {
    console.error('Inventory sync error:', error);
    return api.serverError();
  }
}
