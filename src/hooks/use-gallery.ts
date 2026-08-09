// ---------------------------------------------------------------------------
// useGallery Hooks — Production-Ready TanStack React Query v5 Hooks
// ---------------------------------------------------------------------------
//
// Thin, typed convenience hooks over the generic API hooks. Every function
// talks to `src/services/gallery.service` (the only module that knows the
// /api/admin/gallery endpoint) and returns the standard envelope shape.
// Success/error toasts surface the message coming from the API.
//
// Dependencies:
//   @tanstack/react-query ^5   (already installed)
//   react-hot-toast ^2          (already installed)
//   ../services/gallery.service (thin HTTP layer)
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
  GalleryItem,
  CreateGalleryPayload,
  UpdateGalleryPayload,
  GalleryListParams,
  ApiSuccessResponse,
} from '@/types';
import { ApiError } from '@/types';

import * as galleryApi from '@/services/gallery.service';

// ═══════════════════════════════════════════════════════════════════════════
// 1. QUERY KEY FACTORY
// ═══════════════════════════════════════════════════════════════════════════
// Hierarchical key design: invalidating `galleryKeys.all` cascades to every
// gallery query, while `galleryKeys.lists()` only affects list views.
// ═══════════════════════════════════════════════════════════════════════════

export const galleryKeys = {
  /** Root key — invalidate to refetch ALL gallery queries */
  all: ['gallery'] as const,

  /** Scoped to all list queries (any filter combination) */
  lists: () => [...galleryKeys.all, 'list'] as const,

  /** Unique key per filter/pagination combination */
  list: (params: GalleryListParams) =>
    [...galleryKeys.lists(), params] as const,
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

interface UseGetGalleryItemsParams {
  /** Pagination, search and filter parameters */
  params?: GalleryListParams;
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<GalleryItem[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Fetches a paginated, searchable list of gallery items.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetGalleryItems({
 *   params: { page: 1, limit: 24, search: 'hero' },
 * });
 * const items = data?.data;
 * const meta = data?.meta;
 * ```
 */
export function useGetGalleryItems({ params = {}, options }: UseGetGalleryItemsParams = {}) {
  return useQuery<ApiSuccessResponse<GalleryItem[]>, ApiError>({
    queryKey: galleryKeys.list(params),
    queryFn: () => galleryApi.getGallery(params),
    staleTime: STALE_TIME,
    // Keep showing previous page data while the next page loads.
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// ── useCreateGalleryItem ───────────────────────────────────────────────────

interface UseCreateGalleryItemParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<GalleryItem>,
        ApiError,
        CreateGalleryPayload
      >,
      'mutationFn'
    >
  >;
}

/**
 * Creates a new gallery item (uploaded image or from URL).
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateGalleryItem();
 * mutate({ url: 'https://...', source: 'url' });
 * ```
 */
export function useCreateGalleryItem({ options }: UseCreateGalleryItemParams = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation<
    ApiSuccessResponse<GalleryItem>,
    ApiError,
    CreateGalleryPayload
  >({
    mutationFn: (payload) => galleryApi.createGalleryItem(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Gallery item created successfully');
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to create gallery item');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    ...restOptions,
  });
}

// ── useUpdateGalleryItem ───────────────────────────────────────────────────

interface UseUpdateGalleryItemParams {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<GalleryItem>,
        ApiError,
        UpdateGalleryPayload
      >,
      'mutationFn'
    >
  >;
}

/**
 * Updates an existing gallery item (title, alt text, etc.).
 *
 * @example
 * ```tsx
 * const { mutate } = useUpdateGalleryItem();
 * mutate({ _id: item._id, title: 'New Title', altText: 'New alt' });
 * ```
 */
export function useUpdateGalleryItem({ options }: UseUpdateGalleryItemParams = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options || {};

  return useMutation<
    ApiSuccessResponse<GalleryItem>,
    ApiError,
    UpdateGalleryPayload
  >({
    mutationFn: (payload) => galleryApi.updateGalleryItem(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Gallery item updated successfully');
      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to update gallery item');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    onSettled: (data, error, variables, context, fnContext) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      onSettled?.(data, error, variables, context, fnContext);
    },

    ...restOptions,
  });
}

// ── useDeleteGalleryItem ───────────────────────────────────────────────────

interface UseDeleteGalleryItemParams {
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
 * Deletes a gallery item.
 *
 * @example
 * ```tsx
 * const { mutate } = useDeleteGalleryItem();
 * mutate(item._id);
 * ```
 */
export function useDeleteGalleryItem({ options }: UseDeleteGalleryItemParams = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...restOptions } = options || {};

  return useMutation<ApiSuccessResponse<null>, ApiError, string>({
    mutationFn: (id) => galleryApi.deleteGalleryItem(id),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'Gallery item deleted successfully');
      onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to delete gallery item');
      onError?.(error, variables, onMutateResult, fnContext);
    },

    onSettled: (data, error, variables, context, fnContext) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      onSettled?.(data, error, variables, context, fnContext);
    },

    ...restOptions,
  });
}
