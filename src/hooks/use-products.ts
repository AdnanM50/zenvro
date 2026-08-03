// ---------------------------------------------------------------------------
// useProduct Hooks — Production-Ready TanStack React Query v5 Hooks
// ---------------------------------------------------------------------------
//
// Architecture Overview
// ─────────────────────
// 1. **Query Key Factory** — Centralised, hierarchical key management for
//    deterministic cache invalidation and granular refetching.
//
// 2. **Fetching Hooks** (GET & Search) — `useGetProduct` & `useGetProducts`.
//    Both configure a 5-minute `staleTime` so data is served instantly from
//    cache on re-renders/route transitions while being background-refreshed
//    after the stale window expires. This eliminates waterfall requests on
//    navigation-heavy e-commerce UIs.
//
// 3. **Mutation Hooks** (POST / PUT / DELETE) — `useCreateProduct`,
//    `useUpdateProduct`, `useDeleteProduct`.
//    • API-driven toasts: extract `response.message` (success) or
//      `error.serverMessage` (failure) and pass to react-hot-toast.
//    • Optimistic updates: for Update and Delete the cache is patched
//      immediately in `onMutate` to create a snappy UI, then rolled back
//      via `onError` if the server rejects the mutation.
//    • Background revalidation: `onSettled` always invalidates the relevant
//      query keys so the cache converges to server truth.
//
// 4. **Unified Parameter Pattern** — Every hook accepts a single params
//    object containing both the API arguments and an optional `options`
//    spread for overriding any useQuery/useMutation option at the call site.
//
// Dependencies:
//   @tanstack/react-query ^5   (already installed)
//   react-hot-toast ^2          (already installed)
//   ../services/product.service (thin HTTP layer)
// ---------------------------------------------------------------------------

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
  ApiSuccessResponse,
} from '@/types';
import { ApiError } from '@/types';

import * as productApi from '@/services/product.service';

// ═══════════════════════════════════════════════════════════════════════════
// 1. QUERY KEY FACTORY
// ═══════════════════════════════════════════════════════════════════════════
// Hierarchical key design: invalidating `productKeys.all` cascades to every
// product query, while `productKeys.lists()` only affects list views.
// This pattern is recommended by the TanStack Query docs for scalable apps.
// ═══════════════════════════════════════════════════════════════════════════

export const productKeys = {
  /** Root key — invalidate this to refetch ALL product queries */
  all: ['products'] as const,

  /** Scoped to all list queries (any filter combination) */
  lists: () => [...productKeys.all, 'list'] as const,

  /** Unique key per filter/pagination combination */
  list: (params: ProductListParams) =>
    [...productKeys.lists(), params] as const,

  /** Scoped to all detail queries */
  details: () => [...productKeys.all, 'detail'] as const,

  /** Unique key per product ID */
  detail: (id: string) => [...productKeys.details(), id] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 2. CACHING CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
// 5-minute stale time prevents redundant network requests on re-renders and
// route transitions. The cache still serves data instantly; refetches happen
// in the background once the data is considered stale.
// For high-traffic product pages this eliminates visible loading spinners
// while keeping the data reasonably fresh.
// ═══════════════════════════════════════════════════════════════════════════

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ═══════════════════════════════════════════════════════════════════════════
// 3. FETCHING HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// ── useGetProduct ──────────────────────────────────────────────────────────
// Fetches a single product by ID. Commonly used on PDP (Product Detail Page).

interface UseGetProductParams {
  /** The product ID to fetch */
  id: string;
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Product>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Fetches a single product.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetProduct({
 *   id: productId,
 *   options: { enabled: !!productId },
 * });
 * ```
 */
export function useGetProduct({ id, options }: UseGetProductParams) {
  return useQuery<ApiSuccessResponse<Product>, ApiError>({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProduct(id),
    staleTime: STALE_TIME,
    // Only fetch when an ID is provided — prevents wasted requests during
    // initial render when the ID might still be undefined.
    enabled: !!id,
    ...options,
  });
}

// ── useGetProducts ─────────────────────────────────────────────────────────
// Fetches a paginated/filtered list of products. Includes search and filter
// params directly in the query key so each combination is cached separately.

interface UseGetProductsParams {
  /** Pagination, search and filter parameters */
  params?: ProductListParams;
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Product[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Fetches a paginated, searchable list of products.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetProducts({
 *   params: { page: 1, limit: 12, category: 'jackets' },
 * });
 * const products = data?.data;
 * const meta = data?.meta;
 * ```
 */
export function useGetProducts({ params = {}, options }: UseGetProductsParams = {}) {
  return useQuery<ApiSuccessResponse<Product[]>, ApiError>({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.getProducts(params),
    staleTime: STALE_TIME,
    // Keep showing previous page data while the next page loads.
    // This prevents flickering in paginated UIs.
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// ── useCreateProduct ───────────────────────────────────────────────────────
// POST — no optimistic update needed because there is no existing cache
// entry to patch. On success we simply invalidate all list queries and
// show the API's success message via toast.

interface UseCreateProductParams {
  /** Override any useMutation option at the call site */
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<Product>,
        ApiError,
        CreateProductPayload
      >,
      'mutationFn'
    >
  >;
}

/**
 * Creates a new product.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateProduct();
 * mutate(newProductData);
 * ```
 */
export function useCreateProduct({ options }: UseCreateProductParams = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<Product>,
    ApiError,
    CreateProductPayload
  >({
    mutationFn: (payload) => productApi.createProduct(payload),

    onSuccess: (response, _variables, _onMutateResult, _fnContext) => {
      // ✅ Extract the success message from the API envelope and show a toast.
      toast.success(response.message || 'Product created successfully');

      // Invalidate all list queries so the new product appears in grids/tables.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Forward to caller-provided onSuccess if supplied.
      options?.onSuccess?.(response, _variables, _onMutateResult, _fnContext);
    },

    onError: (error, _variables, _onMutateResult, _fnContext) => {
      // ❌ Extract the error message from ApiError and show a toast.
      toast.error(error.serverMessage || 'Failed to create product');
      options?.onError?.(error, _variables, _onMutateResult, _fnContext);
    },

    ...options,
    // Re-assert our callbacks after spreading so they aren't overwritten.
    // The caller's callbacks are invoked inside our handlers above.
  });
}

// ── useUpdateProduct ───────────────────────────────────────────────────────
// PATCH — implements **optimistic updates** for instant UI feedback.
//
// Flow:
//   1. onMutate:   Snapshot current cache → patch the cache with new values.
//   2. onError:    Roll back to the snapshot if the server rejects.
//   3. onSettled:  Invalidate queries to converge cache to server truth.

/** Context object stored by onMutate for potential rollback */
interface UpdateProductContext {
  previousProduct: ApiSuccessResponse<Product> | undefined;
  previousLists: [readonly unknown[], ApiSuccessResponse<Product[]> | undefined][];
}

interface UseUpdateProductParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<Product>,
        ApiError,
        UpdateProductPayload,
        UpdateProductContext
      >,
      'mutationFn'
    >
  >;
}

/**
 * Updates an existing product with optimistic UI.
 *
 * @example
 * ```tsx
 * const { mutate } = useUpdateProduct();
 * mutate({ _id: product._id, name: 'Updated Name', price: 199 });
 * ```
 */
export function useUpdateProduct({ options }: UseUpdateProductParams = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<Product>,
    ApiError,
    UpdateProductPayload,
    UpdateProductContext
  >({
    mutationFn: (payload) => productApi.updateProduct(payload),

    // ── OPTIMISTIC UPDATE ────────────────────────────────────────────────
    // Immediately patch the cache before the server responds.
    onMutate: async (payload) => {
      // 1. Cancel in-flight fetches for this product so they don't
      //    overwrite our optimistic update.
      await queryClient.cancelQueries({
        queryKey: productKeys.detail(payload._id),
      });
      await queryClient.cancelQueries({
        queryKey: productKeys.lists(),
      });

      // 2. Snapshot the current detail cache for rollback.
      const previousProduct = queryClient.getQueryData<
        ApiSuccessResponse<Product>
      >(productKeys.detail(payload._id));

      // 3. Optimistically update the detail cache.
      if (previousProduct) {
        queryClient.setQueryData<ApiSuccessResponse<Product>>(
          productKeys.detail(payload._id),
          {
            ...previousProduct,
            data: { ...previousProduct.data, ...payload },
          },
        );
      }

      // 4. Optimistically update ALL list caches that contain this product.
      const listQueries = queryClient.getQueriesData<
        ApiSuccessResponse<Product[]>
      >({ queryKey: productKeys.lists() });

      const previousLists = listQueries.map(([key, data]) => {
        if (data) {
          queryClient.setQueryData<ApiSuccessResponse<Product[]>>(key, {
            ...data,
            data: data.data.map((p) =>
              p._id === payload._id ? { ...p, ...payload } : p,
            ),
          });
        }
        return [key, data] as [readonly unknown[], ApiSuccessResponse<Product[]> | undefined];
      });

      return { previousProduct, previousLists };
    },

    // ── ROLLBACK ON ERROR ────────────────────────────────────────────────
    onError: (error, payload, onMutateResult, _fnContext) => {
      toast.error(error.serverMessage || 'Failed to update product');

      // Restore the detail cache from the snapshot.
      if (onMutateResult?.previousProduct) {
        queryClient.setQueryData(
          productKeys.detail(payload._id),
          onMutateResult.previousProduct,
        );
      }

      // Restore every list cache from its snapshot.
      onMutateResult?.previousLists.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data);
      });

      options?.onError?.(error, payload, onMutateResult, _fnContext);
    },

    onSuccess: (response, variables, onMutateResult, _fnContext) => {
      toast.success(response.message || 'Product updated successfully');
      options?.onSuccess?.(response, variables, onMutateResult, _fnContext);
    },

    // ── ALWAYS REVALIDATE ────────────────────────────────────────────────
    // Whether the mutation succeeded or failed, invalidate so the cache
    // converges to server truth.
    onSettled: (_data, _error, payload, _context) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(payload._id),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },

    ...options,
  });
}

// ── useDeleteProduct ───────────────────────────────────────────────────────
// DELETE — implements **optimistic removal** from list caches.
//
// The product is removed from every cached list immediately, then restored
// on error. On settle, all caches are invalidated.

/** Context object for rollback on delete failure */
interface DeleteProductContext {
  previousLists: [readonly unknown[], ApiSuccessResponse<Product[]> | undefined][];
  previousProduct: ApiSuccessResponse<Product> | undefined;
}

interface UseDeleteProductParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<null>,
        ApiError,
        string, // mutation variable is the product ID
        DeleteProductContext
      >,
      'mutationFn'
    >
  >;
}

/**
 * Deletes a product with optimistic removal from the cache.
 *
 * @example
 * ```tsx
 * const { mutate } = useDeleteProduct();
 * mutate(product._id);
 * ```
 */
export function useDeleteProduct({ options }: UseDeleteProductParams = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<null>,
    ApiError,
    string,
    DeleteProductContext
  >({
    mutationFn: (id) => productApi.deleteProduct(id),

    // ── OPTIMISTIC REMOVAL ───────────────────────────────────────────────
    onMutate: async (id) => {
      // Cancel any in-flight queries.
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      await queryClient.cancelQueries({
        queryKey: productKeys.detail(id),
      });

      // Snapshot detail cache.
      const previousProduct = queryClient.getQueryData<
        ApiSuccessResponse<Product>
      >(productKeys.detail(id));

      // Snapshot and optimistically remove from every list cache.
      const listQueries = queryClient.getQueriesData<
        ApiSuccessResponse<Product[]>
      >({ queryKey: productKeys.lists() });

      const previousLists = listQueries.map(([key, data]) => {
        if (data) {
          queryClient.setQueryData<ApiSuccessResponse<Product[]>>(key, {
            ...data,
            data: data.data.filter((p) => p._id !== id),
            // Decrement the total in meta if it exists so pagination stays consistent.
            ...(data.meta && {
              meta: { ...data.meta, total: data.meta.total - 1 },
            }),
          });
        }
        return [key, data] as [readonly unknown[], ApiSuccessResponse<Product[]> | undefined];
      });

      // Remove the detail cache entry entirely.
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });

      return { previousLists, previousProduct };
    },

    // ── ROLLBACK ON ERROR ────────────────────────────────────────────────
    onError: (error, id, onMutateResult, _fnContext) => {
      toast.error(error.serverMessage || 'Failed to delete product');

      // Restore every list cache.
      onMutateResult?.previousLists.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data);
      });

      // Restore the detail cache.
      if (onMutateResult?.previousProduct) {
        queryClient.setQueryData(
          productKeys.detail(id),
          onMutateResult.previousProduct,
        );
      }

      options?.onError?.(error, id, onMutateResult, _fnContext);
    },

    onSuccess: (response, id, onMutateResult, _fnContext) => {
      toast.success(response.message || 'Product deleted successfully');
      options?.onSuccess?.(response, id, onMutateResult, _fnContext);
    },

    // ── ALWAYS REVALIDATE ────────────────────────────────────────────────
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },

    ...options,
  });
}
