import type { WishlistItem, AddWishlistPayload } from '@/types';
import { httpGet, httpPost, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/wishlist';

export function getWishlist() {
  return httpGet<WishlistItem[]>(BASE_URL);
}

export function addToWishlist(payload: AddWishlistPayload) {
  return httpPost<WishlistItem[]>(BASE_URL, payload);
}

export function removeFromWishlist(product: string) {
  return httpDelete<WishlistItem[]>(`${BASE_URL}${buildQueryString({ product })}`);
}
