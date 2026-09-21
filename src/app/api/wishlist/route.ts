import { NextRequest } from 'next/server';
import { requireUser, validateWishlistPayload } from '@/middlewares';
import { UserModel } from '@/models/user.model';
import { ProductModel } from '@/models/product.model';
import { products as fallbackProducts } from '@/lib/products';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const rawWishlist = await UserModel.getWishlist(auth.user._id);
    
    // Enrich wishlist with full product details
    const enrichedWishlist = await Promise.all(
      rawWishlist.map(async (item: any) => {
        const prodId = typeof item === 'string' ? item : item.product || item._id;
        if (!prodId) return item;

        try {
          let dbProd = await ProductModel.findById(prodId);
          if (!dbProd) {
            dbProd = await ProductModel.findBySlug(prodId);
          }

          if (dbProd) {
            return {
              _id: dbProd._id,
              id: dbProd._id,
              product: dbProd._id,
              name: dbProd.name,
              slug: dbProd.slug,
              price: dbProd.salePrice > 0 ? dbProd.salePrice : dbProd.regularPrice,
              regularPrice: dbProd.regularPrice,
              image: dbProd.featuredImage || dbProd.media?.featuredImage || '',
              category: dbProd.category,
              addedAt: item.addedAt || new Date().toISOString(),
            };
          }
        } catch {}

        // Fallback to static mock products if DB lookup returns null
        const fallback = fallbackProducts.find((p) => p.id === prodId || p.slug === prodId);
        if (fallback) {
          const numericPrice = parseFloat(fallback.price.replace(/[^0-9.]/g, '')) || 120;
          return {
            _id: fallback.id,
            id: fallback.id,
            product: fallback.id,
            name: fallback.name,
            slug: fallback.slug,
            price: numericPrice,
            image: fallback.image,
            category: fallback.category,
            addedAt: item.addedAt || new Date().toISOString(),
          };
        }

        return {
          _id: prodId,
          id: prodId,
          product: prodId,
          name: prodId,
          price: 120,
          addedAt: item.addedAt || new Date().toISOString(),
        };
      })
    );

    return api.ok(enrichedWishlist, 'Wishlist fetched');
  } catch (error) {
    console.error('Get wishlist error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const productId = body.product || body.productId || body.id;
    
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return api.badRequest('product parameter is required');
    }

    const cleanId = productId.trim();

    const alreadyAdded = await UserModel.isInWishlist(auth.user._id, cleanId);
    if (alreadyAdded) {
      return api.conflict('Product is already in your wishlist');
    }

    const added = await UserModel.addToWishlist(auth.user._id, cleanId);
    if (!added) return api.notFound('User not found');

    const wishlist = await UserModel.getWishlist(auth.user._id);
    return api.created(wishlist, 'Product added to wishlist');
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return api.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    if (!product) return api.badRequest('product is required');

    const removed = await UserModel.removeFromWishlist(auth.user._id, product);
    if (!removed) return api.notFound('Product not found in wishlist');

    const wishlist = await UserModel.getWishlist(auth.user._id);
    return api.ok(wishlist, 'Product removed from wishlist');
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return api.serverError();
  }
}
