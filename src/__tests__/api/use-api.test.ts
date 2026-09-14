// ---------------------------------------------------------------------------
// Tests: Generic API Hooks (src/hooks/use-api.ts)
// ---------------------------------------------------------------------------
// Comprehensive test suite covering:
//   1. useApiGet — cache behaviour, staleTime, error handling
//   2. useApiPost — mutation, toast success/error, cache invalidation
//   3. useApiPut — mutation, toast, invalidation
//   4. useApiDelete — mutation, toast, invalidation
//   5. createQueryKeys — key factory hierarchy
//
// Uses @testing-library/react renderHook + a real QueryClient per test.
// Toast and queryFn/mutationFn are mocked.
// ---------------------------------------------------------------------------

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import {
  useApiGet,
  useApiPost,
  useApiPut,
  useApiDelete,
  createQueryKeys,
} from '@/hooks/use-api';
import type { ApiSuccessResponse } from '@/types/api';
import { ApiError } from '@/types/api';

// ── Mock react-hot-toast ───────────────────────────────────────────────────
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockToast = toast as jest.Mocked<typeof toast>;

// ── Helper: Create a fresh QueryClient + wrapper for each test ─────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests — fail fast.
        gcTime: 0,    // Garbage collect immediately so tests are isolated.
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

// ── Shared test data ───────────────────────────────────────────────────────

interface TestItem {
  _id: string;
  name: string;
  price: number;
}

const mockItem: TestItem = { _id: '1', name: 'Test Product', price: 99 };

const mockSuccessResponse: ApiSuccessResponse<TestItem> = {
  success: true,
  message: 'Item fetched',
  data: mockItem,
};

const mockListResponse: ApiSuccessResponse<TestItem[]> = {
  success: true,
  message: 'Items fetched',
  data: [mockItem, { _id: '2', name: 'Another', price: 49 }],
  meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
};

const mockApiError = new ApiError(404, 'Item not found');

// ── Reset mocks ────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. useApiGet
// ═══════════════════════════════════════════════════════════════════════════

describe('useApiGet', () => {
  it('fetches data successfully and returns the API envelope', async () => {
    const queryClient = createTestQueryClient();
    const queryFn = jest.fn().mockResolvedValue(mockSuccessResponse);

    const { result } = renderHook(
      () =>
        useApiGet<TestItem>({
          queryKey: ['items', 'detail', '1'],
          queryFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify the data shape
    expect(result.current.data).toEqual(mockSuccessResponse);
    expect(result.current.data?.data).toEqual(mockItem);
    expect(result.current.data?.message).toBe('Item fetched');
  });

  it('handles API errors correctly', async () => {
    const queryClient = createTestQueryClient();
    const queryFn = jest.fn().mockRejectedValue(mockApiError);

    const { result } = renderHook(
      () =>
        useApiGet<TestItem>({
          queryKey: ['items', 'detail', 'bad'],
          queryFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.serverMessage).toBe('Item not found');
    expect(result.current.error?.statusCode).toBe(404);
  });

  it('does not refetch when query is disabled', async () => {
    const queryClient = createTestQueryClient();
    const queryFn = jest.fn().mockResolvedValue(mockSuccessResponse);

    renderHook(
      () =>
        useApiGet<TestItem>({
          queryKey: ['items', 'detail', '1'],
          queryFn,
          options: { enabled: false },
        }),
      { wrapper: createWrapper(queryClient) },
    );

    // Give it some time to ensure it doesn't fire
    await new Promise((r) => setTimeout(r, 50));

    expect(queryFn).not.toHaveBeenCalled();
  });

  it('allows overriding staleTime via options', async () => {
    const queryClient = createTestQueryClient();
    const queryFn = jest.fn().mockResolvedValue(mockSuccessResponse);

    const { result } = renderHook(
      () =>
        useApiGet<TestItem>({
          queryKey: ['items', 'detail', '1'],
          queryFn,
          options: { staleTime: 0 }, // Override default 5-min staleTime
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('returns list data with meta for paginated responses', async () => {
    const queryClient = createTestQueryClient();
    const queryFn = jest.fn().mockResolvedValue(mockListResponse);

    const { result } = renderHook(
      () =>
        useApiGet<TestItem[]>({
          queryKey: ['items', 'list', { page: 1 }],
          queryFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.meta).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. useApiPost
// ═══════════════════════════════════════════════════════════════════════════

describe('useApiPost', () => {
  it('calls mutationFn and shows success toast from API message', async () => {
    const queryClient = createTestQueryClient();
    const createResponse: ApiSuccessResponse<TestItem> = {
      success: true,
      message: 'Product created',
      data: mockItem,
    };
    const mutationFn = jest.fn().mockResolvedValue(createResponse);

    const { result } = renderHook(
      () =>
        useApiPost<TestItem, Partial<TestItem>>({
          mutationFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ name: 'New Product', price: 199 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // v5.101.4 passes (variables, MutationFunctionContext) to mutationFn.
    expect(mutationFn.mock.calls[0][0]).toEqual({ name: 'New Product', price: 199 });
    expect(mockToast.success).toHaveBeenCalledWith('Product created');
  });

  it('shows error toast from API error on failure', async () => {
    const queryClient = createTestQueryClient();
    const mutationFn = jest.fn().mockRejectedValue(
      new ApiError(400, 'Name is required'),
    );

    const { result } = renderHook(
      () =>
        useApiPost<TestItem, Partial<TestItem>>({
          mutationFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ price: 199 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockToast.error).toHaveBeenCalledWith('Name is required');
  });

  it('invalidates specified query keys on success', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const mutationFn = jest.fn().mockResolvedValue({
      success: true,
      message: 'Created',
      data: mockItem,
    });

    const { result } = renderHook(
      () =>
        useApiPost<TestItem, Partial<TestItem>>({
          mutationFn,
          invalidateKeys: [['items', 'list'], ['items']],
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ name: 'New' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items', 'list'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items'] });
  });

  it('uses custom successMessage when provided', async () => {
    const queryClient = createTestQueryClient();
    const mutationFn = jest.fn().mockResolvedValue({
      success: true,
      message: 'API message',
      data: mockItem,
    });

    const { result } = renderHook(
      () =>
        useApiPost<TestItem, Partial<TestItem>>({
          mutationFn,
          successMessage: 'Custom success!',
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ name: 'Test' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Custom message takes precedence over API message.
    expect(mockToast.success).toHaveBeenCalledWith('Custom success!');
  });

  it('uses custom errorMessage when provided', async () => {
    const queryClient = createTestQueryClient();
    const mutationFn = jest.fn().mockRejectedValue(
      new ApiError(500, 'Server crashed'),
    );

    const { result } = renderHook(
      () =>
        useApiPost<TestItem, Partial<TestItem>>({
          mutationFn,
          errorMessage: 'Something went wrong, try again',
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ name: 'Test' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockToast.error).toHaveBeenCalledWith('Something went wrong, try again');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. useApiPut
// ═══════════════════════════════════════════════════════════════════════════

describe('useApiPut', () => {
  it('calls mutationFn and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const updateResponse: ApiSuccessResponse<TestItem> = {
      success: true,
      message: 'Product updated',
      data: { ...mockItem, name: 'Updated Name' },
    };
    const mutationFn = jest.fn().mockResolvedValue(updateResponse);

    const { result } = renderHook(
      () =>
        useApiPut<TestItem, Partial<TestItem> & { _id: string }>({
          mutationFn,
          invalidateKeys: [['items']],
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ _id: '1', name: 'Updated Name' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // v5.101.4 passes (variables, MutationFunctionContext) to mutationFn.
    expect(mutationFn.mock.calls[0][0]).toEqual({ _id: '1', name: 'Updated Name' });
    expect(mockToast.success).toHaveBeenCalledWith('Product updated');
  });

  it('shows error toast on failure', async () => {
    const queryClient = createTestQueryClient();
    const mutationFn = jest.fn().mockRejectedValue(
      new ApiError(404, 'Product not found'),
    );

    const { result } = renderHook(
      () =>
        useApiPut<TestItem, Partial<TestItem>>({
          mutationFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ _id: '999' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockToast.error).toHaveBeenCalledWith('Product not found');
  });

  it('invalidates queries both onSuccess and onSettled', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const mutationFn = jest.fn().mockResolvedValue({
      success: true,
      message: 'Updated',
      data: mockItem,
    });

    const { result } = renderHook(
      () =>
        useApiPut<TestItem, Partial<TestItem>>({
          mutationFn,
          invalidateKeys: [['items', 'detail', '1']],
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ _id: '1', name: 'Updated' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // onSuccess + onSettled both invalidate => at least 2 calls
    const calls = invalidateSpy.mock.calls.filter(
      (call) => JSON.stringify(call[0]) === JSON.stringify({ queryKey: ['items', 'detail', '1'] }),
    );
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. useApiDelete
// ═══════════════════════════════════════════════════════════════════════════

describe('useApiDelete', () => {
  it('calls mutationFn and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const deleteResponse: ApiSuccessResponse<null> = {
      success: true,
      message: 'Product deleted',
      data: null,
    };
    const mutationFn = jest.fn().mockResolvedValue(deleteResponse);

    const { result } = renderHook(
      () =>
        useApiDelete({
          mutationFn,
          invalidateKeys: [['items']],
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // v5.101.4 passes (variables, MutationFunctionContext) to mutationFn.
    expect(mutationFn.mock.calls[0][0]).toBe('1');
    expect(mockToast.success).toHaveBeenCalledWith('Product deleted');
  });

  it('shows error toast on delete failure', async () => {
    const queryClient = createTestQueryClient();
    const mutationFn = jest.fn().mockRejectedValue(
      new ApiError(403, 'Cannot delete featured product'),
    );

    const { result } = renderHook(
      () =>
        useApiDelete({
          mutationFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockToast.error).toHaveBeenCalledWith('Cannot delete featured product');
  });

  it('invalidates all specified keys on success', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const mutationFn = jest.fn().mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null,
    });

    const { result } = renderHook(
      () =>
        useApiDelete({
          mutationFn,
          invalidateKeys: [['items'], ['items', 'list']],
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items', 'list'] });
  });

  it('works with custom payload types (not just string)', async () => {
    const queryClient = createTestQueryClient();
    const mutationFn = jest.fn().mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null,
    });

    const { result } = renderHook(
      () =>
        useApiDelete<{ id: string; reason: string }>({
          mutationFn,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({ id: '1', reason: 'Out of stock' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // v5.101.4 passes (variables, MutationFunctionContext) to mutationFn.
    expect(mutationFn.mock.calls[0][0]).toEqual({ id: '1', reason: 'Out of stock' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. createQueryKeys
// ═══════════════════════════════════════════════════════════════════════════

describe('createQueryKeys', () => {
  const keys = createQueryKeys('products');

  it('creates the root "all" key', () => {
    expect(keys.all).toEqual(['products']);
  });

  it('creates the "lists" scope key', () => {
    expect(keys.lists()).toEqual(['products', 'list']);
  });

  it('creates a "list" key with filter params', () => {
    expect(keys.list({ page: 1, category: 'jackets' })).toEqual([
      'products',
      'list',
      { page: 1, category: 'jackets' },
    ]);
  });

  it('creates the "details" scope key', () => {
    expect(keys.details()).toEqual(['products', 'detail']);
  });

  it('creates a "detail" key with ID', () => {
    expect(keys.detail('abc-123')).toEqual(['products', 'detail', 'abc-123']);
  });

  it('produces different keys for different entities', () => {
    const orderKeys = createQueryKeys('orders');
    expect(orderKeys.all).not.toEqual(keys.all);
    expect(orderKeys.lists()).toEqual(['orders', 'list']);
  });

  it('list keys with different params produce different keys', () => {
    const key1 = keys.list({ page: 1 });
    const key2 = keys.list({ page: 2 });
    expect(key1).not.toEqual(key2);
  });
});
