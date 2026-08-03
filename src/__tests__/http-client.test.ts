// ---------------------------------------------------------------------------
// Tests: HTTP Client (src/lib/http-client.ts)
// ---------------------------------------------------------------------------
// Validates the generic fetch wrapper, convenience methods, and query string
// builder in isolation using a mocked global fetch.
// ---------------------------------------------------------------------------

import {
  httpClient,
  httpGet,
  httpPost,
  httpPut,
  httpPatch,
  httpDelete,
  buildQueryString,
} from '@/lib/http-client';
import { ApiError } from '@/types/api';

// ── Mock global fetch ──────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockSuccessResponse<T>(data: T, message = 'Success') {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, message, data }),
  };
}

function mockErrorResponse(error: string, status = 400) {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, error, statusCode: status }),
  };
}

// ── Reset mocks between tests ──────────────────────────────────────────────

beforeEach(() => {
  mockFetch.mockReset();
});

// ═══════════════════════════════════════════════════════════════════════════
// httpClient
// ═══════════════════════════════════════════════════════════════════════════

describe('httpClient', () => {
  it('returns the full success envelope on 2xx response', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse({ id: '1', name: 'Test' }));

    const result = await httpClient<{ id: string; name: string }>('/api/test');

    expect(result).toEqual({
      success: true,
      message: 'Success',
      data: { id: '1', name: 'Test' },
    });
  });

  it('sends credentials: include and Content-Type header by default', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse(null));

    await httpClient('/api/test');

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('merges custom headers without losing Content-Type', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse(null));

    await httpClient('/api/test', {
      headers: { 'X-Custom': 'value' },
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Custom': 'value' },
    });
  });

  it('throws ApiError on non-2xx response', async () => {
    mockFetch.mockResolvedValue(mockErrorResponse('Not found', 404));

    await expect(httpClient('/api/test')).rejects.toThrow(ApiError);
    await expect(httpClient('/api/test')).rejects.toMatchObject({
      statusCode: 404,
      serverMessage: 'Not found',
    });
  });

  it('throws ApiError when response.ok but success is false', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        error: 'Validation failed',
        statusCode: 400,
      }),
    });

    await expect(httpClient('/api/test')).rejects.toThrow(ApiError);
  });

  it('uses fallback error message when server returns neither error nor message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false }),
    });

    await expect(httpClient('/api/test')).rejects.toMatchObject({
      serverMessage: 'An unexpected error occurred',
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Convenience methods
// ═══════════════════════════════════════════════════════════════════════════

describe('httpGet', () => {
  it('sends a GET request', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse([1, 2, 3]));

    const result = await httpGet<number[]>('/api/items');

    expect(result.data).toEqual([1, 2, 3]);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('httpPost', () => {
  it('sends a POST request with JSON body', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse({ id: '1' }, 'Created'));

    const result = await httpPost<{ id: string }>('/api/items', { name: 'New' });

    expect(result.message).toBe('Created');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New' }),
      }),
    );
  });
});

describe('httpPut', () => {
  it('sends a PUT request with JSON body', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse({ id: '1' }, 'Updated'));

    const result = await httpPut<{ id: string }>('/api/items/1', { name: 'Updated' });

    expect(result.message).toBe('Updated');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items/1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      }),
    );
  });
});

describe('httpPatch', () => {
  it('sends a PATCH request with JSON body', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse({ id: '1' }, 'Patched'));

    await httpPatch('/api/items/1', { name: 'Patched' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Patched' }),
      }),
    );
  });
});

describe('httpDelete', () => {
  it('sends a DELETE request', async () => {
    mockFetch.mockResolvedValue(mockSuccessResponse(null, 'Deleted'));

    const result = await httpDelete<null>('/api/items/1');

    expect(result.message).toBe('Deleted');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items/1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// buildQueryString
// ═══════════════════════════════════════════════════════════════════════════

describe('buildQueryString', () => {
  it('builds a query string from a params object', () => {
    const result = buildQueryString({ page: 1, limit: 20, search: 'jacket' });
    expect(result).toBe('?page=1&limit=20&search=jacket');
  });

  it('skips undefined and null values', () => {
    const result = buildQueryString({ page: 1, search: undefined, sort: null });
    expect(result).toBe('?page=1');
  });

  it('joins arrays with commas', () => {
    const result = buildQueryString({ tags: ['sale', 'new'] });
    expect(result).toBe('?tags=sale%2Cnew');
  });

  it('skips empty arrays', () => {
    const result = buildQueryString({ tags: [] });
    expect(result).toBe('');
  });

  it('returns empty string when all values are undefined', () => {
    const result = buildQueryString({ a: undefined, b: null });
    expect(result).toBe('');
  });

  it('handles boolean values', () => {
    const result = buildQueryString({ isActive: true, isFeatured: false });
    expect(result).toBe('?isActive=true&isFeatured=false');
  });
});
