// ---------------------------------------------------------------------------
// useWishlist Hooks — TanStack React Query v5 hooks over the wishlist service
// ---------------------------------------------------------------------------

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { WishlistItem, AddWishlistPayload, ApiSuccessResponse } from '@/types';
import { ApiError } from '@/types';

import * as wishlistApi from '@/services/wishlist.service';

export const wishlistKeys = {
  all: ['wishlist'] as const,
  list: () => [...wishlistKeys.all, 'list'] as const,
  check: (productId: string) => [...wishlistKeys.all, 'check', productId] as const,
} as const;

const STALE_TIME = 5 * 60 * 1000;

export function useWishlist({
  options,
}: {
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<WishlistItem[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
} = {}) {
  return useQuery<ApiSuccessResponse<WishlistItem[]>, ApiError>({
    queryKey: wishlistKeys.list(),
    queryFn: () => wishlistApi.getWishlist(),
    staleTime: STALE_TIME,
    ...options,
  });
}

// ── useAddToWishlist ───────────────────────────────────────────────────────

export function useAddToWishlist({
  options,
}: {
  options?: Partial<
    Omit<
      UseMutationOptions<ApiSuccessResponse<WishlistItem[]>, ApiError, AddWishlistPayload>,
      'mutationFn'
    >
  >;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<WishlistItem[]>, ApiError, AddWishlistPayload>({
    mutationFn: (payload) => wishlistApi.addToWishlist(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Added to wishlist');
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to add to wishlist');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}

// ── useRemoveFromWishlist ──────────────────────────────────────────────────

export function useRemoveFromWishlist({
  options,
}: {
  options?: Partial<
    Omit<
      UseMutationOptions<ApiSuccessResponse<WishlistItem[]>, ApiError, string>,
      'mutationFn'
    >
  >;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<WishlistItem[]>, ApiError, string>({
    mutationFn: (product) => wishlistApi.removeFromWishlist(product),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(variables) });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to remove from wishlist');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}
