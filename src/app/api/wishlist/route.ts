import { NextRequest } from 'next/server';
import { requireUser } from '@/middlewares';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const wishlist = await UserModel.getWishlist(auth.user._id);
    return api.ok(wishlist, 'Wishlist fetched');
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
    const { product } = body;

    if (typeof product !== 'string' || !product.trim()) {
      return api.badRequest('product is required');
    }

    const alreadyAdded = await UserModel.isInWishlist(auth.user._id, product.trim());
    if (alreadyAdded) {
      return api.conflict('Product is already in your wishlist');
    }

    const added = await UserModel.addToWishlist(auth.user._id, product.trim());
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
