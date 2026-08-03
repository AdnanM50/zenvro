// ---------------------------------------------------------------------------
// Category API Service
// ---------------------------------------------------------------------------
// Thin HTTP layer responsible for making the actual fetch calls.
// This module is consumed by the generic React Query hooks — it is the ONLY
// place that knows about endpoint URLs and HTTP methods.
//
// Uses the shared httpClient from src/lib/http-client.ts so it benefits from
// cookie-based auth, typed envelopes, ApiError throwing, and query-string
// serialisation — the same conventions as every other service module.
// ---------------------------------------------------------------------------

import type { Category } from '@/types';
import {
  httpGet,
  httpPost,
  httpPatch,
  httpDelete,
  buildQueryString,
} from '@/lib/http-client';

const BASE_URL = '/api/admin/categories';

// ── Params & payload types ─────────────────────────────────────────────────

/** Query params for the paginated/searchable category list endpoint */
export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
}

/** Payload for creating a category (loose — matches the form's optional fields) */
export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parentCategory?: string;
  image?: string;
  description?: string;
  seo?: Partial<Category['seo']>;
  isActive: boolean;
}

/** Payload for updating a category — `_id` identifies the row to patch */
export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  _id: string;
}

// ── Public API ─────────────────────────────────────────────────────────────

/** GET a paginated/filtered list of categories */
export function getCategories(params: CategoryListParams = {}) {
  return httpGet<Category[]>(`${BASE_URL}${buildQueryString(params)}`);
}

/** POST — create a new category */
export function createCategory(payload: CreateCategoryPayload) {
  return httpPost<Category>(BASE_URL, payload);
}

/** PATCH — update an existing category */
export function updateCategory(payload: UpdateCategoryPayload) {
  return httpPatch<Category>(BASE_URL, payload);
}

/** DELETE — remove a category by ID */
export function deleteCategory(id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${id}`);
}
