import { NextRequest } from 'next/server';
import { ProductModel } from '@/models/product.model';
import { CategoryModel } from '@/models/category.model';
import { TagModel } from '@/models/tag.model';
import { api } from '@/lib/api-response';
import { formatProductForUI } from '@/lib/products';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * PUBLIC product detail API endpoint (no auth required).
 * Returns a single published product by slug (or ID) along with related published products.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return api.badRequest('Product slug is required');
    }

    let product = await ProductModel.findBySlug(slug);
    if (!product) {
      product = await ProductModel.findById(slug);
    }

    if (!product || product.status !== 'published') {
      return api.notFound('Product not found');
    }

    // Build category name map
    let categoryMap: Record<string, string> = {};
    try {
      const allCategories = await CategoryModel.findAll();
      allCategories.forEach((cat) => {
        if (cat._id) categoryMap[cat._id] = cat.name;
        if (cat.slug) categoryMap[cat.slug] = cat.name;
        if (cat.name) categoryMap[cat.name] = cat.name;
      });
    } catch (e) {
      console.error('Error fetching categories for map:', e);
    }

    // Build tag name map
    let tagMap: Record<string, string> = {};
    try {
      const allTags = await TagModel.findAll();
      allTags.forEach((t) => {
        if (t._id) tagMap[t._id] = t.name;
        if (t.slug) tagMap[t.slug] = t.name;
        if (t.name) tagMap[t.name] = t.name;
      });
    } catch (e) {
      console.error('Error fetching tags for map:', e);
    }

    // Fetch related published products
    const catResult = await ProductModel.findPaginated(1, 10, {
      category: product.category,
      status: 'published',
    });
    const categoryProducts = catResult?.products || [];

    const relatedRaw = categoryProducts
      .filter((p) => p._id !== product._id && p.slug !== product.slug)
      .slice(0, 3);

    // If category has fewer than 3 related, fill from other published products
    if (relatedRaw.length < 3) {
      const allResult = await ProductModel.findPaginated(1, 10, {
        status: 'published',
      });
      const allPublished = allResult?.products || [];
      const extra = allPublished.filter(
        (p) => p._id !== product._id && p.slug !== product.slug && !relatedRaw.some((r) => r._id === p._id)
      );
      relatedRaw.push(...extra.slice(0, 3 - relatedRaw.length));
    }

    const formattedProduct = formatProductForUI(product, categoryMap, tagMap);
    const formattedRelated = relatedRaw.map((p) => formatProductForUI(p, categoryMap, tagMap));

    return api.ok(
      {
        product: formattedProduct,
        relatedProducts: formattedRelated,
      },
      'Product details fetched successfully'
    );
  } catch (error) {
    console.error('Get public product by slug error:', error);
    return api.serverError('Failed to fetch product details');
  }
}
