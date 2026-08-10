// ---------------------------------------------------------------------------
// usePublicPage — Public CMS Page Hook (TanStack React Query v5)
// ---------------------------------------------------------------------------
//
// Thin, typed hook that fetches a published CMS page for the PUBLIC site
// (e.g. /about, /contact, /privacy, /terms) via `src/services/page.service`.
//
// Rendering strategy: these pages are statically generated with ISR
// (revalidate = 60s on the route). The server passes the prerendered page as
// `initialPage`, which this hook seeds into React Query as `initialData` — so
// the first paint is instant and NO extra network request fires on mount.
// `staleTime` keeps the cached copy fresh, and the admin "save" endpoints
// trigger on-demand ISR revalidation (revalidatePath) so edits appear on the
// next request without waiting for the 60s window.
//
// Dependencies:
//   @tanstack/react-query ^5   (already installed)
//   ../services/page.service   (thin HTTP layer)
// ---------------------------------------------------------------------------

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { ApiSuccessResponse, Page } from '@/types';
import { ApiError } from '@/types';

import * as pagesApi from '@/services/page.service';

// ═══════════════════════════════════════════════════════════════════════════
// 1. QUERY KEY FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export const publicPageKeys = {
  /** Root key — invalidate to refetch ALL public pages */
  all: ['public-pages'] as const,

  /** Scoped to a single published page by slug */
  bySlug: (slug: string) => [...publicPageKeys.all, slug] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 2. CACHING CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
// Public pages change rarely (admin edits trigger ISR revalidation). A 5-minute
// stale time prevents redundant refetches on re-renders, route transitions,
// and window focus while staying acceptably fresh.
// ═══════════════════════════════════════════════════════════════════════════

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ═══════════════════════════════════════════════════════════════════════════
// 3. FETCHING HOOK
// ═══════════════════════════════════════════════════════════════════════════

interface UsePublicPageParams {
  /** CMS page slug, e.g. 'about-us', 'contact-us', 'privacy-policy' */
  slug: string;
  /** Page prerendered by the server component (SSG/ISR). Seeds the cache so no
   *  client request fires on mount. Pass `null`/undefined when unavailable. */
  initialPage?: Page | null;
  /** Override any useQuery option at the call site */
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<Page>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

/**
 * Fetches a published CMS page for the public site.
 *
 * @example
 * ```tsx
 * const { data, isError } = usePublicPage({ slug: 'privacy-policy', initialPage });
 * const page = data?.data;
 * ```
 */
export function usePublicPage({ slug, initialPage, options }: UsePublicPageParams) {
  return useQuery<ApiSuccessResponse<Page>, ApiError>({
    queryKey: publicPageKeys.bySlug(slug),
    queryFn: () => pagesApi.getPageBySlug(slug),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    // Seed the cache from the server-prerendered page → instant first paint,
    // no refetch while the data is fresh.
    ...(initialPage
      ? {
          initialData: {
            success: true,
            message: 'Cached page',
            data: initialPage,
          } satisfies ApiSuccessResponse<Page>,
        }
      : {}),
    ...options,
  });
}
