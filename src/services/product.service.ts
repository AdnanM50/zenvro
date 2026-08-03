// ---------------------------------------------------------------------------
// Product API Service
// ---------------------------------------------------------------------------
// Thin HTTP layer responsible for making the actual fetch calls.
// This module is consumed by React Query hooks — it is the ONLY place that
// knows about endpoint URLs and HTTP methods.
//
// All functions return the typed `data` payload extracted from the API envelope,
// and throw `ApiError` on non-2xx responses so that React Query's error
// handling (and our toast callbacks) work correctly.
// ---------------------------------------------------------------------------

import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
  ApiSuccessResponse,
  ApiResponseMeta,
} from '@/types';
import { ApiError } from '@/types';

const BASE_URL = '/api/admin/products';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generic fetch wrapper that:
 *  1. Sends the request with credentials (cookies) included.
 *  2. Parses the JSON envelope.
 *  3. Throws `ApiError` for non-success responses so React Query treats them
 *     as errors (triggering `onError` callbacks and toast.error).
 *
 * Returns the full success envelope so callers can access both `data` and
 * `message` — the message is forwarded to toast.success by the hooks.
 */
async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new ApiError(
      response.status,
      json.error || json.message || 'An unexpected error occurred',
    );
  }

  return json as ApiSuccessResponse<T>;
}

// ── Serialise query params ─────────────────────────────────────────────────

function buildSearchParams(params: ProductListParams): string {
  const sp = new URLSearchParams();

  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.limit !== undefined) sp.set('limit', String(params.limit));
  if (params.search) sp.set('search', params.search);
  if (params.category) sp.set('category', params.category);
  if (params.minPrice !== undefined) sp.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) sp.set('maxPrice', String(params.maxPrice));
  if (params.sortBy) sp.set('sortBy', params.sortBy);
  if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
  if (params.isFeatured !== undefined) sp.set('isFeatured', String(params.isFeatured));
  if (params.isActive !== undefined) sp.set('isActive', String(params.isActive));
  if (params.tags?.length) sp.set('tags', params.tags.join(','));

  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

// ── Public API ─────────────────────────────────────────────────────────────

/** GET a single product by ID */
export async function getProduct(id: string) {
  return request<Product>(`${BASE_URL}/${id}`);
}

/** GET a paginated/filtered list of products */
export async function getProducts(params: ProductListParams = {}) {
  return request<Product[]>(`${BASE_URL}${buildSearchParams(params)}`);
}

/** POST — create a new product */
export async function createProduct(payload: CreateProductPayload) {
  return request<Product>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** PATCH — update an existing product */
export async function updateProduct(payload: UpdateProductPayload) {
  return request<Product>(BASE_URL, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** DELETE — remove a product by ID */
export async function deleteProduct(id: string) {
  return request<null>(`${BASE_URL}?_id=${id}`, {
    method: 'DELETE',
  });
}

// ── Re-export response shape for hook consumers ────────────────────────────

export type ProductListResponse = ApiSuccessResponse<Product[]> & {
  meta?: ApiResponseMeta;
};
