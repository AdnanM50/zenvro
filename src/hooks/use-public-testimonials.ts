// ---------------------------------------------------------------------------
// usePublicTestimonials — Public Testimonials Hook (TanStack React Query v5)
// ---------------------------------------------------------------------------
//
// Thin, typed hook that fetches testimonials for the PUBLIC homepage from
// `src/services/testimonial.service` (GET /api/testimonials — public, no auth).
// The testimonials are managed in the private admin panel
// (`/api/admin/testimonials`).
//
// Rendering strategy: the homepage is statically generated with ISR
// (revalidate = 60s on the route). The server passes the prerendered
// testimonials as `initialTestimonials`, which this hook seeds into React
// Query as `initialData` — so the first paint is instant and NO extra network
// request fires on mount. `staleTime` keeps the cached copy fresh, and the
// admin CRUD endpoints revalidate the homepage so edits appear on the next
// request without waiting for the 60s window.
//
// Dependencies:
//   @tanstack/react-query ^5   (already installed)
//   ../services/testimonial.service   (thin HTTP layer)
// ---------------------------------------------------------------------------

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { ApiSuccessResponse, Testimonial } from '@/types';
import { ApiError } from '@/types';

import * as testimonialsApi from '@/services/testimonial.service';

// ═══════════════════════════════════════════════════════════════════════════
// 1. QUERY KEY FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export const publicTestimonialKeys = {
  /** Root key — invalidate to refetch ALL public testimonials */
  all: ['public-testimonials'] as const,

  /** Scoped to a list with optional params (e.g. `{ limit: 50 }`) */
  list: (params: { limit?: number }) => [...publicTestimonialKeys.all, 'list', params] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 2. CACHING CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
// Testimonials change rarely (admin edits trigger ISR revalidation). A 5-minute
// stale time prevents redundant refetches on re-renders, route transitions,
// and window focus while staying acceptably fresh.
// ═══════════════════════════════════════════════════════════════════════════

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ═══════════════════════════════════════════════════════════════════════════
// 3. FETCHING HOOK
// ═══════════════════════════════════════════════════════════════════════════

interface UsePublicTestimonialsParams {
  /** Testimonials prerendered by the server component (SSG/ISR). Seeds the
   *  cache so no client request fires on mount. Pass `null`/undefined when
   *  unavailable or when there are no testimonials yet. */
  initialTestimonials?: Testimonial[] | null;
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Testimonial[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Fetches active testimonials for the public homepage.
 *
 * @example
 * ```tsx
 * const { data } = usePublicTestimonials({ initialTestimonials });
 * const testimonials = data?.data ?? [];
 * ```
 */
export function usePublicTestimonials({ initialTestimonials, options }: UsePublicTestimonialsParams = {}) {
  return useQuery<ApiSuccessResponse<Testimonial[]>, ApiError>({
    queryKey: publicTestimonialKeys.list({}),
    queryFn: () => testimonialsApi.getPublicTestimonials(),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    // Seed the cache from the server-prerendered testimonials → instant first
    // paint, no refetch while the data is fresh.
    ...(initialTestimonials && initialTestimonials.length > 0
      ? {
          initialData: {
            success: true,
            message: 'Cached testimonials',
            data: initialTestimonials,
          } satisfies ApiSuccessResponse<Testimonial[]>,
        }
      : {}),
    ...options,
  });
}
