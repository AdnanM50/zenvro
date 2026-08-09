// ---------------------------------------------------------------------------
// useCoupon Hooks — Production-Ready TanStack React Query v5 Hooks
// ---------------------------------------------------------------------------
//
// Thin, typed convenience hooks over the generic API hooks. Every function
// talks to `src/services/coupon.service` (the only module that knows the
// /api/admin/coupons endpoint) and returns the standard envelope shape.
//
// Dependencies:
//   @tanstack/react-query ^5   (already installed)
//   react-hot-toast ^2          (already installed)
//   ../services/coupon.service (thin HTTP layer)
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
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponListParams,
  ApiSuccessResponse,
} from '@/types';
import { ApiError } from '@/types';

import * as couponApi from '@/services/coupon.service';

// ═══════════════════════════════════════════════════════════════════════════
// 1. QUERY KEY FACTORY
// ═══════════════════════════════════════════════════════════════════════════
// Hierarchical key design: invalidating `couponKeys.all` cascades to every
// coupon query, while `couponKeys.lists()` only affects list views.
// ═══════════════════════════════════════════════════════════════════════════

export const couponKeys = {
  /** Root key — invalidate to refetch ALL coupon queries */
  all: ['coupons'] as const,

  /** Scoped to all list queries (any filter combination) */
  lists: () => [...couponKeys.all, 'list'] as const,

  /** Unique key per filter/pagination combination */
  list: (params: CouponListParams) =>
    [...couponKeys.lists(), params] as const,
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

interface UseGetCouponsParams {
  /** Pagination, search and filter parameters */
  params?: CouponListParams;
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Coupon[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Fetches a paginated, searchable list of coupons.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetCoupons({
 *   params: { page: 1, limit: 12, status: 'active' },
 * });
 * const coupons = data?.data;
 * const meta = data?.meta;
 * ```
 */
export function useGetCoupons({ params = {}, options }: UseGetCouponsParams = {}) {
  return useQuery<ApiSuccessResponse<Coupon[]>, ApiError>({
    queryKey: couponKeys.list(params),
    queryFn: () => couponApi.getCoupons(params),
    staleTime: STALE_TIME,
    // Keep showing previous page data while the next page loads.
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// ── useCreateCoupon ────────────────────────────────────────────────────────

interface UseCreateCouponParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<Coupon>,
        ApiError,
        CreateCouponPayload
      >,
      'mutationFn'
    >
  >;
}

/**
 * Creates a new coupon.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateCoupon();
 * mutate(newCouponData);
 * ```
 */
export function useCreateCoupon({ options }: UseCreateCouponParams = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation<
    ApiSuccessResponse<Coupon>,
    ApiError,
    CreateCouponPayload
  >({
    mutationFn: (payload) => couponApi.createCoupon(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to create coupon');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    ...restOptions,
  });
}

// ── useUpdateCoupon ────────────────────────────────────────────────────────

interface UseUpdateCouponParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<Coupon>,
        ApiError,
        UpdateCouponPayload
      >,
      'mutationFn'
    >
  >;
}

/**
 * Updates an existing coupon.
 *
 * @example
 * ```tsx
 * const { mutate } = useUpdateCoupon();
 * mutate({ _id: coupon._id, value: 15 });
 * ```
 */
export function useUpdateCoupon({ options }: UseUpdateCouponParams = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options || {};

  return useMutation<
    ApiSuccessResponse<Coupon>,
    ApiError,
    UpdateCouponPayload
  >({
    mutationFn: (payload) => couponApi.updateCoupon(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Coupon updated successfully');
      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to update coupon');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    onSettled: (data, error, variables, context, fnContext) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      onSettled?.(data, error, variables, context, fnContext);
    },

    ...restOptions,
  });
}

// ── useDeleteCoupon ────────────────────────────────────────────────────────

interface UseDeleteCouponParams {
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
 * Deletes a coupon.
 *
 * @example
 * ```tsx
 * const { mutate } = useDeleteCoupon();
 * mutate(coupon._id);
 * ```
 */
export function useDeleteCoupon({ options }: UseDeleteCouponParams = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options || {};

  return useMutation<ApiSuccessResponse<null>, ApiError, string>({
    mutationFn: (id) => couponApi.deleteCoupon(id),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Coupon deleted successfully');
      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to delete coupon');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    onSettled: (data, error, variables, context, fnContext) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      onSettled?.(data, error, variables, context, fnContext);
    },

    ...restOptions,
  });
}
