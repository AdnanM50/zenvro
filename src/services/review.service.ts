import type {
  Review,
  CreateReviewPayload,
  ReviewListParams,
  ProductRatingSummary,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const ADMIN_BASE_URL = '/api/admin/reviews';
const PUBLIC_BASE_URL = '/api/reviews';

export function getAdminReviews(params: ReviewListParams = {}) {
  return httpGet<Review[]>(`${ADMIN_BASE_URL}${buildQueryString(params)}`);
}

export function getProductReviews(product: string) {
  return httpGet<Review[]>(`${PUBLIC_BASE_URL}?product=${encodeURIComponent(product)}`);
}

export function getProductRatingSummary(product: string) {
  return httpGet<ProductRatingSummary>(`${PUBLIC_BASE_URL}/summary?product=${encodeURIComponent(product)}`);
}

export function createReview(payload: CreateReviewPayload) {
  return httpPost<Review>(PUBLIC_BASE_URL, payload);
}

export function updateReviewApproval(payload: { _id: string; status: 'pending' | 'approved' | 'rejected' }) {
  return httpPatch<null>(ADMIN_BASE_URL, payload);
}

export function deleteReview(_id: string) {
  return httpDelete<null>(`${ADMIN_BASE_URL}?_id=${_id}`);
}
