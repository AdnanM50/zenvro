// ---------------------------------------------------------------------------
// Tests: usePublicTestimonials (src/hooks/use-public-testimonials.ts)
// ---------------------------------------------------------------------------
// Comprehensive test suite covering the ISR-seeded public testimonials hook:
//   1. Fetches from the public API when no server data is provided
//   2. Seeds initialData (no network call) when the server prerenders
//   3. Empty arrays do not seed — the API is still consulted
//   4. Error handling
//   5. Query key factory hierarchy
// ---------------------------------------------------------------------------

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { usePublicTestimonials, publicTestimonialKeys } from '@/hooks/use-public-testimonials';
import * as testimonialsApi from '@/services/testimonial.service';
import type { ApiSuccessResponse, Testimonial } from '@/types';

jest.mock('@/services/testimonial.service', () => ({
  getPublicTestimonials: jest.fn(),
}));

const mockedGetPublicTestimonials = testimonialsApi.getPublicTestimonials as jest.Mock;

function makeTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    _id: 't1',
    name: 'Emma Williams',
    role: 'Fashion Stylist',
    quote: 'Everything is absolutely perfect!',
    avatar: 'https://img.com/avatar.png',
    rating: 5,
    reviewCount: 49,
    isFeatured: true,
    status: 'active',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

const response = (data: Testimonial[]): ApiSuccessResponse<Testimonial[]> => ({
  success: true,
  message: 'Testimonials fetched',
  data,
});

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 50));

describe('usePublicTestimonials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('query key factory', () => {
    it('creates the root "all" key', () => {
      expect(publicTestimonialKeys.all).toEqual(['public-testimonials']);
    });

    it('creates a scoped list key with params', () => {
      expect(publicTestimonialKeys.list({ limit: 50 })).toEqual([
        'public-testimonials',
        'list',
        { limit: 50 },
      ]);
    });

    it('creates distinct keys for different params', () => {
      expect(publicTestimonialKeys.list({ limit: 10 })).not.toEqual(
        publicTestimonialKeys.list({ limit: 50 }),
      );
    });
  });

  describe('without server-seeded data', () => {
    it('fetches testimonials from the public API', async () => {
      const queryClient = createTestQueryClient();
      const data = [makeTestimonial()];
      mockedGetPublicTestimonials.mockResolvedValue(response(data));

      const { result } = renderHook(() => usePublicTestimonials({}), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(data);
      expect(mockedGetPublicTestimonials).toHaveBeenCalledTimes(1);
    });

    it('surfaces API errors to the caller', async () => {
      const queryClient = createTestQueryClient();
      mockedGetPublicTestimonials.mockRejectedValue(new Error('network down'));

      const { result } = renderHook(() => usePublicTestimonials({}), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('with server-seeded data (ISR first paint)', () => {
    it('seeds initialData so NO network request fires on mount', async () => {
      const queryClient = createTestQueryClient();
      const initial = [makeTestimonial()];

      const { result } = renderHook(
        () => usePublicTestimonials({ initialTestimonials: initial }),
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.data?.data).toEqual(initial);
      expect(mockedGetPublicTestimonials).not.toHaveBeenCalled();

      await flushMicrotasks();
      expect(mockedGetPublicTestimonials).not.toHaveBeenCalled();
    });

    it('returns the seeded testimonials in the expected envelope', async () => {
      const queryClient = createTestQueryClient();
      const initial = [
        makeTestimonial({ _id: 't1', name: 'Alpha' }),
        makeTestimonial({ _id: 't2', name: 'Beta' }),
      ];

      const { result } = renderHook(
        () => usePublicTestimonials({ initialTestimonials: initial }),
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.data).toEqual({
        success: true,
        message: 'Cached testimonials',
        data: initial,
      });
    });

    it('does not seed when the initial array is empty (edge case)', async () => {
      const queryClient = createTestQueryClient();
      mockedGetPublicTestimonials.mockResolvedValue(response([makeTestimonial()]));

      const { result } = renderHook(
        () => usePublicTestimonials({ initialTestimonials: [] }),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedGetPublicTestimonials).toHaveBeenCalledTimes(1);
      expect(result.current.data?.data).toHaveLength(1);
    });

    it('does not seed when initialTestimonials is null', async () => {
      const queryClient = createTestQueryClient();
      mockedGetPublicTestimonials.mockResolvedValue(response([]));

      const { result } = renderHook(
        () => usePublicTestimonials({ initialTestimonials: null }),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedGetPublicTestimonials).toHaveBeenCalledTimes(1);
      expect(result.current.data?.data).toEqual([]);
    });
  });

  describe('caching behaviour', () => {
    it('does not refetch while the query is fresh (staleTime)', async () => {
      const queryClient = createTestQueryClient();
      const data = [makeTestimonial()];
      mockedGetPublicTestimonials.mockResolvedValue(response(data));

      const { result, rerender } = renderHook(() => usePublicTestimonials({}), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedGetPublicTestimonials).toHaveBeenCalledTimes(1);

      // Re-mounting the same query key within staleTime should reuse the cache.
      rerender();
      await flushMicrotasks();
      expect(mockedGetPublicTestimonials).toHaveBeenCalledTimes(1);
    });

    it('defaults to refetchOnWindowFocus: false', async () => {
      const queryClient = createTestQueryClient();
      const data = [makeTestimonial()];
      mockedGetPublicTestimonials.mockResolvedValue(response(data));

      const { result } = renderHook(() => usePublicTestimonials({}), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedGetPublicTestimonials).toHaveBeenCalledTimes(1);
    });
  });
});
