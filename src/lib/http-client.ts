// ---------------------------------------------------------------------------
// Generic HTTP Client
// ---------------------------------------------------------------------------
// A single, reusable fetch wrapper used by ALL API hooks across the app.
// Every service file (products, orders, categories, etc.) should import
// from here instead of writing its own fetch logic.
//
// Features:
//   • Typed success/error envelopes matching the server's api-response.ts
//   • Automatic cookie-based auth (credentials: 'include')
//   • Throws ApiError on non-2xx so React Query treats it as an error
//   • Query string builder for GET list endpoints
// ---------------------------------------------------------------------------

import type { ApiSuccessResponse } from '@/types/api';
import { ApiError } from '@/types/api';

/**
 * Core fetch wrapper.
 * Returns the full ApiSuccessResponse envelope so hooks can read both
 * `data` (for cache) and `message` (for toasts).
 */
export async function httpClient<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiSuccessResponse<T>> {
  const { headers: customHeaders, ...restOptions } = options;

  const response = await fetch(url, {
    credentials: 'include',
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    },
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

// ── Convenience methods ────────────────────────────────────────────────────

/** GET request */
export function httpGet<T>(url: string, options?: RequestInit) {
  return httpClient<T>(url, { method: 'GET', ...options });
}

/** POST request with JSON body */
export function httpPost<T>(url: string, body: unknown, options?: RequestInit) {
  return httpClient<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

/** PUT request with JSON body */
export function httpPut<T>(url: string, body: unknown, options?: RequestInit) {
  return httpClient<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
}

/** PATCH request with JSON body */
export function httpPatch<T>(url: string, body: unknown, options?: RequestInit) {
  return httpClient<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options,
  });
}

/** DELETE request */
export function httpDelete<T>(url: string, options?: RequestInit) {
  return httpClient<T>(url, { method: 'DELETE', ...options });
}

// ── Query string helper ────────────────────────────────────────────────────

/**
 * Builds a query string from a flat params object.
 * Skips undefined/null values. Joins arrays with commas.
 */
export function buildQueryString<T extends object>(
  params: T,
): string {
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const v = value as
      | string
      | number
      | boolean
      | string[]
      | undefined
      | null;
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (v.length > 0) sp.set(key, v.join(','));
    } else {
      sp.set(key, String(v));
    }
  }

  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}
