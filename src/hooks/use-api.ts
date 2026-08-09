// ---------------------------------------------------------------------------
// Generic API Hooks — useApiGet, useApiPost, useApiPut, useApiDelete
// ---------------------------------------------------------------------------
//
// Industry-standard, entity-agnostic React Query v5 hooks that work with ANY
// endpoint. Instead of writing a new hook for every entity (products, orders,
// categories, users …), compose these generics with your API service layer.
//
// Architecture:
//   Component → useApiGet / useApiPost / … → httpClient → fetch → API
//
// Each hook follows a strict unified pattern:
//   1. Accepts a single params object (API args + optional query/mutation options)
//   2. Returns the standard React Query result shape
//   3. Handles toasts, cache invalidation, and error mapping automatically
//
// Dependencies:
//   @tanstack/react-query ^5.101.4   (v5 object signatures only)
//   react-hot-toast ^2               (for API-driven toast notifications)
//   ../lib/http-client               (generic fetch wrapper)
// ---------------------------------------------------------------------------

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { ApiSuccessResponse } from '@/types/api';
import { ApiError } from '@/types/api';

// ═══════════════════════════════════════════════════════════════════════════
// CACHE DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════
// 5-minute staleTime prevents redundant re-fetches across route transitions
// and re-renders. Data is served from cache instantly and background-
// refreshed after the stale window. This is the recommended default for
// e-commerce where product/order data changes infrequently within a session.
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ═══════════════════════════════════════════════════════════════════════════
// 1. useApiGet — Generic GET hook (single item OR list)
// ═══════════════════════════════════════════════════════════════════════════

export interface UseApiGetParams<TData> {
  /** Unique cache key for this query */
  queryKey: QueryKey;
  /** Async function that performs the actual HTTP GET */
  queryFn: () => Promise<ApiSuccessResponse<TData>>;
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<TData>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Generic GET hook for fetching any resource.
 *
 * @example
 * ```tsx
 * // Fetch a single product
 * const { data, isLoading } = useApiGet({
 *   queryKey: ['products', 'detail', productId],
 *   queryFn: () => httpGet<Product>(`/api/products/${productId}`),
 * });
 *
 * // Fetch a filtered list
 * const { data } = useApiGet({
 *   queryKey: ['products', 'list', { page: 1 }],
 *   queryFn: () => httpGet<Product[]>('/api/products?page=1'),
 * });
 * ```
 */
export function useApiGet<TData>({
  queryKey,
  queryFn,
  options,
}: UseApiGetParams<TData>) {
  return useQuery<ApiSuccessResponse<TData>, ApiError>({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 0,
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. useApiPost — Generic POST hook (create resources)
// ═══════════════════════════════════════════════════════════════════════════

export interface UseApiPostParams<TData, TPayload> {
  /** Async function that performs the actual HTTP POST */
  mutationFn: (payload: TPayload) => Promise<ApiSuccessResponse<TData>>;
  /**
   * Query keys to invalidate on success.
   * Pass the key factory output, e.g. `productKeys.lists()`.
   */
  invalidateKeys?: QueryKey[];
  /** Custom success toast message. If omitted, uses the API response message. */
  successMessage?: string;
  /** Custom error toast message. If omitted, uses the API error message. */
  errorMessage?: string;
  /** Override any useMutation option at the call site */
  options?: Partial<
    Omit<UseMutationOptions<ApiSuccessResponse<TData>, ApiError, TPayload>, 'mutationFn'>
  >;
}

/**
 * Generic POST hook for creating any resource.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useApiPost<Product, CreateProductPayload>({
 *   mutationFn: (data) => httpPost<Product>('/api/products', data),
 *   invalidateKeys: [productKeys.lists()],
 * });
 * mutate({ name: 'New Product', price: 99, ... });
 * ```
 */
export function useApiPost<TData, TPayload>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  options,
}: UseApiPostParams<TData, TPayload>) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation<ApiSuccessResponse<TData>, ApiError, TPayload>({
    mutationFn,

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      // ✅ Show success toast from the API message or the custom override.
      toast.success(successMessage || response.message || 'Created successfully');

      // Invalidate specified query keys so lists refresh with new data.
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
        queryClient.refetchQueries({ queryKey: key });
      });

      // Forward to caller's onSuccess if provided.
      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      // ❌ Show error toast from the API error or the custom override.
      toast.error(errorMessage || error.serverMessage || 'Operation failed');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    ...restOptions,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. useApiPut — Generic PUT/PATCH hook (update resources)
// ═══════════════════════════════════════════════════════════════════════════

export interface UseApiPutParams<TData, TPayload> {
  /** Async function that performs the actual HTTP PUT/PATCH */
  mutationFn: (payload: TPayload) => Promise<ApiSuccessResponse<TData>>;
  /**
   * Query keys to invalidate on success AND on settle (for revalidation).
   * Typically includes both the detail key and the lists key.
   */
  invalidateKeys?: QueryKey[];
  /** Custom success toast message */
  successMessage?: string;
  /** Custom error toast message */
  errorMessage?: string;
  /** Override any useMutation option at the call site */
  options?: Partial<
    Omit<UseMutationOptions<ApiSuccessResponse<TData>, ApiError, TPayload>, 'mutationFn'>
  >;
}

/**
 * Generic PUT/PATCH hook for updating any resource.
 *
 * @example
 * ```tsx
 * const { mutate } = useApiPut<Product, UpdateProductPayload>({
 *   mutationFn: (data) => httpPatch<Product>('/api/products', data),
 *   invalidateKeys: [productKeys.lists(), productKeys.detail(id)],
 * });
 * mutate({ _id: id, name: 'Updated' });
 * ```
 */
export function useApiPut<TData, TPayload>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  options,
}: UseApiPutParams<TData, TPayload>) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options || {};

  return useMutation<ApiSuccessResponse<TData>, ApiError, TPayload>({
    mutationFn,

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(successMessage || response.message || 'Updated successfully');

      // Invalidate to refetch latest data from server.
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
        queryClient.refetchQueries({ queryKey: key });
      });

      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(errorMessage || error.serverMessage || 'Update failed');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    // Always revalidate so cache converges to server truth.
    onSettled: (_data, _error, variables, context, fnContext) => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
        queryClient.refetchQueries({ queryKey: key });
      });
      onSettled?.(_data, _error, variables, context, fnContext);
    },

    ...restOptions,
  });
}

/**
 * Alias for `useApiPut` — convenience export so callers can use
 * `useApiPatch` when issuing HTTP PATCH requests. The hook is identical.
 */
export const useApiPatch = useApiPut;
export type UseApiPatchParams<TData, TPayload> = UseApiPutParams<TData, TPayload>;

// ═══════════════════════════════════════════════════════════════════════════
// 4. useApiDelete — Generic DELETE hook
// ═══════════════════════════════════════════════════════════════════════════

export interface UseApiDeleteParams<TPayload = string> {
  /** Async function that performs the actual HTTP DELETE */
  mutationFn: (payload: TPayload) => Promise<ApiSuccessResponse<null>>;
  /**
   * Query keys to invalidate after deletion.
   * Typically the root entity key so ALL related queries refresh.
   */
  invalidateKeys?: QueryKey[];
  /** Custom success toast message */
  successMessage?: string;
  /** Custom error toast message */
  errorMessage?: string;
  /** Override any useMutation option at the call site */
  options?: Partial<
    Omit<UseMutationOptions<ApiSuccessResponse<null>, ApiError, TPayload>, 'mutationFn'>
  >;
}

/**
 * Generic DELETE hook for removing any resource.
 *
 * @example
 * ```tsx
 * const { mutate } = useApiDelete({
 *   mutationFn: (id) => httpDelete<null>(`/api/products?_id=${id}`),
 *   invalidateKeys: [productKeys.all],
 * });
 * mutate(productId);
 * ```
 */
export function useApiDelete<TPayload = string>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  options,
}: UseApiDeleteParams<TPayload>) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options || {};

  return useMutation<ApiSuccessResponse<null>, ApiError, TPayload>({
    mutationFn,

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(successMessage || response.message || 'Deleted successfully');

      // Invalidate all related caches — the resource no longer exists.
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
        queryClient.refetchQueries({ queryKey: key });
      });

      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(errorMessage || error.serverMessage || 'Delete failed');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    // Always revalidate on settle (whether success or failure).
    onSettled: (_data, _error, variables, context, fnContext) => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
        queryClient.refetchQueries({ queryKey: key });
      });
      onSettled?.(_data, _error, variables, context, fnContext);
    },

    ...restOptions,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. QUERY KEY FACTORY HELPER
// ═══════════════════════════════════════════════════════════════════════════
// Use this to generate hierarchical, type-safe query keys for any entity.
// This pattern is recommended by TanStack Query for large-scale apps.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a hierarchical query key factory for any entity.
 *
 * @example
 * ```tsx
 * const orderKeys = createQueryKeys('orders');
 *
 * orderKeys.all           // ['orders']
 * orderKeys.lists()       // ['orders', 'list']
 * orderKeys.list({ page: 1 }) // ['orders', 'list', { page: 1 }]
 * orderKeys.details()     // ['orders', 'detail']
 * orderKeys.detail('123') // ['orders', 'detail', '123']
 * ```
 */
export function createQueryKeys<TEntity extends string>(entity: TEntity) {
  return {
    /** Root key — invalidate to refetch ALL queries for this entity */
    all: [entity] as const,

    /** All list queries (any filter combination) */
    lists: () => [entity, 'list'] as const,

    /** A specific list with filters/pagination */
    list: (params: Record<string, unknown>) =>
      [entity, 'list', params] as const,

    /** All detail queries */
    details: () => [entity, 'detail'] as const,

    /** A single detail by ID */
    detail: (id: string) => [entity, 'detail', id] as const,
  } as const;
}
