// ---------------------------------------------------------------------------
// useReview Hooks — TanStack React Query v5 hooks over the review service
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
  Review,
  CreateReviewPayload,
  ReviewListParams,
  ProductRatingSummary,
  ApiSuccessResponse,
} from '@/types';
import { ApiError } from '@/types';

import * as reviewApi from '@/services/review.service';

export const reviewKeys = {
  all: ['reviews'] as const,
  admin: () => [...reviewKeys.all, 'admin'] as const,
  adminList: (params: ReviewListParams) => [...reviewKeys.admin(), params] as const,
  product: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  summary: (productId: string) => [...reviewKeys.all, 'summary', productId] as const,
} as const;

const STALE_TIME = 5 * 60 * 1000;

interface UseGetAdminReviewsParams {
  params?: ReviewListParams;
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Review[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

export function useGetAdminReviews({ params = {}, options }: UseGetAdminReviewsParams = {}) {
  return useQuery<ApiSuccessResponse<Review[]>, ApiError>({
    queryKey: reviewKeys.adminList(params),
    queryFn: () => reviewApi.getAdminReviews(params),
    staleTime: STALE_TIME,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

interface UseGetProductReviewsParams {
  productId: string;
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Review[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

export function useGetProductReviews({ productId, options }: UseGetProductReviewsParams) {
  return useQuery<ApiSuccessResponse<Review[]>, ApiError>({
    queryKey: reviewKeys.product(productId),
    queryFn: () => reviewApi.getProductReviews(productId),
    staleTime: STALE_TIME,
    ...options,
  });
}

interface UseGetProductRatingSummaryParams {
  productId: string;
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<ProductRatingSummary>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

export function useGetProductRatingSummary({ productId, options }: UseGetProductRatingSummaryParams) {
  return useQuery<ApiSuccessResponse<ProductRatingSummary>, ApiError>({
    queryKey: reviewKeys.summary(productId),
    queryFn: () => reviewApi.getProductRatingSummary(productId),
    staleTime: STALE_TIME,
    ...options,
  });
}

// ── useCreateReview ────────────────────────────────────────────────────────

export function useCreateReview({
  options,
}: {
  options?: Partial<
    Omit<
      UseMutationOptions<ApiSuccessResponse<Review>, ApiError, CreateReviewPayload>,
      'mutationFn'
    >
  >;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<Review>, ApiError, CreateReviewPayload>({
    mutationFn: (payload) => reviewApi.createReview(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Review submitted');
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(variables.product) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.summary(variables.product) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to submit review');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}

// ── useUpdateReviewApproval ────────────────────────────────────────────────

interface UseUpdateReviewApprovalParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<null>,
        ApiError,
        { _id: string; status: 'pending' | 'approved' | 'rejected' }
      >,
      'mutationFn'
    >
  >;
}

export function useUpdateReviewApproval({ options }: UseUpdateReviewApprovalParams = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<null>,
    ApiError,
    { _id: string; status: 'pending' | 'approved' | 'rejected' }
  >({
    mutationFn: (payload) => reviewApi.updateReviewApproval(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Review updated');
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to update review');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}

// ── useDeleteReview ────────────────────────────────────────────────────────

interface UseDeleteReviewParams {
  options?: Partial<
    Omit<
      UseMutationOptions<ApiSuccessResponse<null>, ApiError, string>,
      'mutationFn'
    >
  >;
}

export function useDeleteReview({ options }: UseDeleteReviewParams = {}) {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<null>, ApiError, string>({
    mutationFn: (id) => reviewApi.deleteReview(id),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Review deleted');
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to delete review');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}
