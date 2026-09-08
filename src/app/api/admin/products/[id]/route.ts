import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { ProductModel } from '@/models/product.model';
import { api } from '@/lib/api-response';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    if (!id) return api.badRequest('_id is required');

    const product = await ProductModel.findById(id);
    if (!product) return api.notFound('Product not found');

    return api.ok(product, 'Product fetched');
  } catch (error) {
    console.error('Get product error:', error);
    return api.serverError();
  }
}
