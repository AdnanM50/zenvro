import { NextRequest } from 'next/server';
import { CollectionModel } from '@/models/collection.model';
import { ProductModel } from '@/models/product.model';
import { CategoryModel } from '@/models/category.model';
import { TagModel } from '@/models/tag.model';
import { api } from '@/lib/api-response';
import { formatProductForUI } from '@/lib/products';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * PUBLIC collection detail API endpoint (no auth required).
 * Returns single collection by slug (or ID) and its published products.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return api.badRequest('Collection slug is required');
    }

    let collectionItem = await CollectionModel.findBySlug(slug);
    if (!collectionItem) {
      collectionItem = await CollectionModel.findById(slug);
    }

    if (!collectionItem || collectionItem.isActive === false) {
      return api.notFound('Collection not found');
    }

    // Build category map
    let categoryMap: Record<string, string> = {};
    try {
      const allCategories = await CategoryModel.findAll();
      allCategories.forEach((cat) => {
        if (cat._id) categoryMap[cat._id] = cat.name;
        if (cat.slug) categoryMap[cat.slug] = cat.name;
        if (cat.name) categoryMap[cat.name] = cat.name;
      });
    } catch {}

    // Build tag map
    let tagMap: Record<string, string> = {};
    try {
      const allTags = await TagModel.findAll();
      allTags.forEach((t) => {
        if (t._id) tagMap[t._id] = t.name;
        if (t.slug) tagMap[t.slug] = t.name;
        if (t.name) tagMap[t.name] = t.name;
      });
    } catch {}

    // Find products in this collection
    const productsResult = await ProductModel.findPaginated(1, 50, {
      collection: collectionItem._id,
      status: 'published',
    });

    let rawProducts = productsResult?.products || [];

    // Fallback search by slug or name if none found by ID
    if (rawProducts.length === 0) {
      const fallbackResult = await ProductModel.findPaginated(1, 50, {
        collection: collectionItem.slug,
        status: 'published',
      });
      rawProducts = fallbackResult?.products || [];
    }

    const formattedProducts = rawProducts.map((p) =>
      formatProductForUI(JSON.parse(JSON.stringify(p)), categoryMap, tagMap)
    );

    return api.ok(
      {
        collection: collectionItem,
        products: formattedProducts,
      },
      'Collection details fetched successfully'
    );
  } catch (error) {
    console.error('Get public collection by slug error:', error);
    return api.serverError('Failed to fetch collection details');
  }
}
