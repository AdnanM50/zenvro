import { NextRequest } from 'next/server';
import { FlashSaleModel } from '@/models/flash-sale.model';
import { ProductModel } from '@/models/product.model';
import { api } from '@/lib/api-response';
import type { Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '5', 10)));

    const allSales = await FlashSaleModel.findAll();
    const now = new Date();

    // Filter active / home flash sales
    let activeSales = allSales.filter((sale) => {
      if (sale.status === 'inactive' || sale.status === 'ended') return false;
      if (sale.startsAt && new Date(sale.startsAt) > now) return false;
      if (sale.endsAt && new Date(sale.endsAt) < now) return false;
      return true;
    });

    if (activeSales.length === 0 && allSales.length > 0) {
      activeSales = allSales.slice(0, 1);
    }

    // Hydrate each flash sale with product details
    const hydratedSales = await Promise.all(
      activeSales.slice(0, limit).map(async (sale) => {
        let products: Product[] = [];
        if (sale.productIds && sale.productIds.length > 0) {
          const fetched = await Promise.all(
            sale.productIds.map((id) => ProductModel.findById(id))
          );
          products = fetched.filter((p): p is Product => p !== null);
        }

        // Fallback: If no products linked to the sale, get top featured products
        if (products.length === 0) {
          const { products: topProducts } = await ProductModel.findPaginated(1, 8, {
            status: 'active',
          });
          products = topProducts;
        }

        return {
          ...sale,
          products,
        };
      })
    );

    return api.ok(hydratedSales, 'Active flash sales fetched');
  } catch (error) {
    console.error('Public flash sales error:', error);
    return api.serverError('Failed to fetch flash sales');
  }
}
