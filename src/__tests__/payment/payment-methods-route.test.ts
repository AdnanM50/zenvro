jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json(data: any, init?: { status?: number }) {
        const res = Object.create(Response.prototype);
        res.status = init?.status ?? 200;
        res.json = async () => data;
        return res;
      },
    },
  };
});

jest.mock('@/lib/auth', () => ({
  verifyAccessToken: jest.fn(),
}));

jest.mock('@/models/user.model', () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock('@/models/payment-method.model', () => ({
  PaymentMethodModel: {
    getAll: jest.fn(),
    getByProvider: jest.fn(),
    upsert: jest.fn(),
    testConnection: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { GET, PATCH } from '@/app/api/admin/payment-methods/route';
import { POST as TEST_POST } from '@/app/api/admin/payment-methods/test/route';

const adminUser = { _id: 'admin-1', role: 'admin' };
const regularUser = { _id: 'u2', role: 'user' };

function makeRequest(options: { method?: string; body?: unknown; token?: string | null } = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    cookies: {
      get: (name: string) => (token && name === 'access_token' ? { value: token } : undefined),
    },
    json: async () => options.body ?? {},
  } as unknown as NextRequest;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseResponse(res: any) {
  return { status: res.status, body: await res.json() };
}

describe('Payment Methods Admin API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'admin-1', role: 'admin' });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/payment-methods', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await GET(makeRequest({ token: null }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(regularUser);
      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);
      expect(status).toBe(403);
    });

    it('returns list of payment methods for admin', async () => {
      const mockMethods = [
        { provider: 'stripe', name: 'Stripe', isEnabled: true, isTestMode: true, publishableKey: 'pk_test_123', secretKey: 'sk_test_123' },
        { provider: 'razorpay', name: 'Razorpay', isEnabled: false, isTestMode: true, keyId: 'rzp_test_123', keySecret: 'sec_123' },
      ];
      (PaymentMethodModel.getAll as jest.Mock).mockResolvedValue(mockMethods);

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockMethods);
    });
  });

  describe('PATCH /api/admin/payment-methods', () => {
    it('returns 400 if provider is missing', async () => {
      const res = await PATCH(makeRequest({ body: { isEnabled: true } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toMatch(/provider is required/i);
    });

    it('returns 400 if provider is invalid', async () => {
      const res = await PATCH(makeRequest({ body: { provider: 'invalid_gateway' } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toMatch(/invalid payment method provider/i);
    });

    it('updates Stripe credentials with 2 secret fields', async () => {
      const payload = {
        provider: 'stripe',
        isEnabled: true,
        isTestMode: true,
        publishableKey: 'pk_test_sample',
        secretKey: 'sk_test_sample',
      };
      const updatedObj = { ...payload, name: 'Stripe' };
      (PaymentMethodModel.upsert as jest.Mock).mockResolvedValue(updatedObj);

      const res = await PATCH(makeRequest({ body: payload }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(PaymentMethodModel.upsert).toHaveBeenCalledWith('stripe', {
        isEnabled: true,
        isTestMode: true,
        publishableKey: 'pk_test_sample',
        secretKey: 'sk_test_sample',
      });
    });
  });

  describe('POST /api/admin/payment-methods/test', () => {
    it('returns 400 when test connection fails', async () => {
      (PaymentMethodModel.testConnection as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid Stripe Secret Key format',
        details: { publishableKeyValid: true, secretKeyValid: false },
      });

      const res = await TEST_POST(
        makeRequest({
          body: {
            provider: 'stripe',
            isTestMode: true,
            publishableKey: 'pk_test_123',
            secretKey: 'invalid_secret',
          },
        })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('Invalid Stripe Secret Key format');
    });

    it('returns 200 when test connection passes', async () => {
      (PaymentMethodModel.testConnection as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Stripe Test credentials format verified successfully!',
        provider: 'stripe',
        isTestMode: true,
        timestamp: new Date().toISOString(),
      });

      const res = await TEST_POST(
        makeRequest({
          body: {
            provider: 'stripe',
            isTestMode: true,
            publishableKey: 'pk_test_valid',
            secretKey: 'sk_test_valid',
          },
        })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.success).toBe(true);
    });
  });
});
