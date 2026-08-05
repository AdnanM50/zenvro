// ---------------------------------------------------------------------------
// useProduct Hooks — Production-Ready TanStack React Query v5 Hooks
// ---------------------------------------------------------------------------
//
// Thin, typed convenience hooks over the generic API hooks. Every function
// talks to `src/services/product.service` (the only module that knows the
// /api/admin/products endpoint) and returns the standard envelope shape.
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
// ═══════════════════════════════════════════════════════════════════════════

export const productKeys = {
  /** Root key — invalidate to refetch ALL product queries */
  all: ['products'] as const,

  /** Scoped to all list queries (any filter combination) */
  lists: () => [...productKeys.all, 'list'] as const,

  /** Unique key per filter/pagination combination */
  list: (params: ProductListParams) =>
    [...productKeys.lists(), params] as const,

  /** Single product detail by id */
  detail: (productId: string) =>
    [...productKeys.all, 'detail', productId] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 2. CACHING CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
// 5-minute stale time prevents redundant network requests on re-renders and
// route transitions while keeping the cache reasonably fresh.
// ═══════════════════════════════════════════════════════════════════════════

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ═══════════════════════════════════════════════════════════════════════════
// 3. FETCHING HOOKS
// ═══════════════════════════════════════════════════════════════════════════

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
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

// ── useGetProduct ──────────────────────────────────────────────────────────

interface UseGetProductParams {
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Product>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Fetches a single product by id.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetProduct(productId);
 * const product = data?.data;
 * ```
 */
export function useGetProduct(productId: string, { options }: UseGetProductParams = {}) {
  return useQuery<ApiSuccessResponse<Product>, ApiError>({
    queryKey: productKeys.detail(productId),
    queryFn: () => productApi.getProduct(productId),
    enabled: Boolean(productId),
    staleTime: STALE_TIME,
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// ── useCreateProduct ───────────────────────────────────────────────────────

interface UseCreateProductParams {
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

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Product created successfully');
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to create product');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}

// ── useUpdateProduct ───────────────────────────────────────────────────────

interface UseUpdateProductParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<Product>,
        ApiError,
        UpdateProductPayload
      >,
      'mutationFn'
    >
  >;
}

/**
 * Updates an existing product.
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
    UpdateProductPayload
  >({
    mutationFn: (payload) => productApi.updateProduct(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Product updated successfully');
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to update product');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },

    ...options,
  });
}

// ── useDeleteProduct ───────────────────────────────────────────────────────

interface UseDeleteProductParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<null>,
        ApiError,
        string
      >,
      'mutationFn'
    >
  >;
}

/**
 * Deletes a product.
 *
 * @example
 * ```tsx
 * const { mutate } = useDeleteProduct();
 * mutate(product._id);
 * ```
 */
export function useDeleteProduct({ options }: UseDeleteProductParams = {}) {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<null>, ApiError, string>({
    mutationFn: (id) => productApi.deleteProduct(id),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Product deleted successfully');
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to delete product');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },

    ...options,
  });
}