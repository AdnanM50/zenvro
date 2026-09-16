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

jest.mock('@/models/payment-method.model', () => ({
  PaymentMethodModel: {
    getAll: jest.fn(),
    getByProvider: jest.fn(),
  },
}));

jest.mock('@/models/order.model', () => ({
  OrderModel: {
    create: jest.fn(),
    findById: jest.fn(),
    updatePaymentStatus: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  verifyAccessToken: jest.fn(),
}));

import type { NextRequest } from 'next/server';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { OrderModel } from '@/models/order.model';
import { verifyAccessToken } from '@/lib/auth';
import { GET as getConfig } from '@/app/api/payment/config/route';
import { POST as createPaymentIntent } from '@/app/api/checkout/create-payment-intent/route';
import { POST as createSession } from '@/app/api/checkout/create-session/route';
import { POST as processPayment } from '@/app/api/checkout/process-payment/route';
import { GET as getOrder } from '@/app/api/orders/[id]/route';

function makeRequest(options: { body?: unknown; token?: string | null; url?: string } = {}): NextRequest {
  const token = options.token;
  const reqUrl = options.url || 'http://localhost:3000';
  return {
    url: reqUrl,
    nextUrl: new URL(reqUrl),
    headers: {
      get: () => null,
    },
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

describe('Cart & Payment Flow Comprehensive API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* =========================================================================
   * 1. GET /api/payment/config
   * ========================================================================= */
  describe('GET /api/payment/config', () => {
    it('returns client safe payment config without exposing secret keys', async () => {
      (PaymentMethodModel.getAll as jest.Mock).mockResolvedValue([
        {
          provider: 'stripe',
          isEnabled: true,
          isTestMode: true,
          publishableKey: 'pk_test_sample123',
          secretKey: 'sk_test_super_secret_should_not_leak',
        },
        {
          provider: 'cod',
          isEnabled: true,
        },
      ]);

      const res = await getConfig();
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.stripe.publishableKey).toBe('pk_test_sample123');
      expect(body.data.stripe.secretKey).toBeUndefined();
      expect(body.data.cod.isEnabled).toBe(true);
    });

    it('returns default fallback config when no payment methods exist in database', async () => {
      (PaymentMethodModel.getAll as jest.Mock).mockResolvedValue([]);

      const res = await getConfig();
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.stripe.isEnabled).toBe(true);
      expect(body.data.cod.isEnabled).toBe(true);
    });
  });

  /* =========================================================================
   * 2. POST /api/checkout/create-payment-intent
   * ========================================================================= */
  describe('POST /api/checkout/create-payment-intent', () => {
    it('returns 400 when items array is empty or missing', async () => {
      const res1 = await createPaymentIntent(makeRequest({ body: { items: [] } }));
      const { status: status1, body: body1 } = await parseResponse(res1);
      expect(status1).toBe(400);
      expect(body1.error).toMatch(/cart is empty/i);

      const res2 = await createPaymentIntent(makeRequest({ body: {} }));
      const { status: status2, body: body2 } = await parseResponse(res2);
      expect(status2).toBe(400);
      expect(body2.error).toMatch(/cart is empty/i);
    });

    it('returns simulated payment intent fallback when Stripe secret key is not configured by admin', async () => {
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue(null);

      const items = [{ key: 'item-1', slug: 'puffer', name: 'Coat', price: 100, quantity: 1 }];
      const res = await createPaymentIntent(makeRequest({ body: { items } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data.simulated).toBe(true);
      expect(body.data.clientSecret).toBeDefined();
    });

    it('calculates total with standard $15 shipping fee when subtotal is under $300', async () => {
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_mock_123',
      });

      const items = [{ key: 'item-1', slug: 'shirt', name: 'Silk Shirt', price: 200, quantity: 1 }];
      const res = await createPaymentIntent(makeRequest({ body: { items } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(215); // 200 + 15
    });

    it('calculates total with $0 free shipping when subtotal is $300 or more', async () => {
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_mock_123',
      });

      const items = [{ key: 'item-1', slug: 'jacket', name: 'Leather Jacket', price: 350, quantity: 1 }];
      const res = await createPaymentIntent(makeRequest({ body: { items } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(350); // 350 + 0 free shipping
    });
  });

  /* =========================================================================
   * 3. POST /api/checkout/create-session (Stripe Hosted Checkout)
   * ========================================================================= */
  describe('POST /api/checkout/create-session', () => {
    it('returns 400 if cart items array is empty or missing', async () => {
      const res = await createSession(
        makeRequest({
          body: {
            items: [],
            shippingAddress: { fullName: 'Nafi', address: '123 St', city: 'NYC' },
          },
        })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/cart is empty/i);
    });

    it('returns 400 if shipping address is missing required fields (fullName, address, city)', async () => {
      const res1 = await createSession(
        makeRequest({
          body: {
            items: [{ key: '1', name: 'Item', price: 100, quantity: 1 }],
            shippingAddress: { fullName: 'Nafi' }, // missing address and city
          },
        })
      );
      const { status: status1, body: body1 } = await parseResponse(res1);
      expect(status1).toBe(400);
      expect(body1.error).toMatch(/shipping address is required/i);

      const res2 = await createSession(
        makeRequest({
          body: {
            items: [{ key: '1', name: 'Item', price: 100, quantity: 1 }],
            shippingAddress: { fullName: 'Nafi', address: '123 Main' }, // missing city
          },
        })
      );
      const { status: status2, body: body2 } = await parseResponse(res2);
      expect(status2).toBe(400);
      expect(body2.error).toMatch(/shipping address is required/i);
    });

    it('returns 400 if Stripe admin secretKey is missing or invalid', async () => {
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'invalid_secret_key_without_sk_prefix',
      });

      const res = await createSession(
        makeRequest({
          body: {
            items: [{ key: '1', name: 'Item', price: 100, quantity: 1 }],
            shippingAddress: { fullName: 'Nafi', address: '123 Main', city: 'NYC' },
          },
        })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toMatch(/secret key is missing or invalid/i);
    });

    it('returns 400 with Stripe error message when Stripe API fails', async () => {
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_bad_key',
      });

      (OrderModel.create as jest.Mock).mockResolvedValue({
        orderNumber: 'VL-ERR123',
        shipping: 15,
      });

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { message: 'Invalid API Key provided' },
        }),
      } as unknown as Response);

      const res = await createSession(
        makeRequest({
          body: {
            items: [{ key: '1', name: 'Item', price: 100, quantity: 1 }],
            shippingAddress: { fullName: 'Nafi', address: '123 Main', city: 'NYC' },
          },
        })
      );

      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('Invalid API Key provided');

      global.fetch = originalFetch;
    });

    it('creates Stripe checkout session successfully with authenticated user token', async () => {
      (verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-999',
        email: 'user999@test.com',
      });

      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_mock_12345',
        isEnabled: true,
      });

      (OrderModel.create as jest.Mock).mockResolvedValue({
        _id: 'order_mongo_id',
        orderNumber: 'VL-778899',
        shipping: 15,
      });

      (OrderModel.updatePaymentStatus as jest.Mock).mockResolvedValue({
        orderNumber: 'VL-778899',
      });

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'cs_test_mock_session_id',
          url: 'https://checkout.stripe.com/c/pay/cs_test_mock_session_id',
        }),
      } as unknown as Response);

      const res = await createSession(
        makeRequest({
          token: 'valid-user-jwt',
          body: {
            items: [
              {
                key: 'prod1-M',
                id: 'prod1',
                name: 'Silk Shirt',
                price: 150,
                quantity: 1,
                size: 'M',
              },
            ],
            shippingAddress: {
              fullName: 'Nafi',
              email: 'nafi@test.com',
              address: '123 Broadway',
              city: 'New York',
            },
          },
        })
      );

      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_mock_session_id');
      expect(body.data.orderNumber).toBe('VL-778899');

      global.fetch = originalFetch;
    });

    it('creates Stripe checkout session with free shipping line item omitted when subtotal >= $300', async () => {
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_mock_12345',
      });

      (OrderModel.create as jest.Mock).mockResolvedValue({
        _id: 'order_mongo_id_2',
        orderNumber: 'VL-300PLUS',
        shipping: 0,
      });

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'cs_test_free_ship_id',
          url: 'https://checkout.stripe.com/c/pay/cs_test_free_ship_id',
        }),
      } as unknown as Response);

      const res = await createSession(
        makeRequest({
          body: {
            items: [{ key: '1', name: 'Luxury Overcoat', price: 450, quantity: 1 }],
            shippingAddress: { fullName: 'Nafi', address: '123 Main', city: 'NYC' },
          },
        })
      );

      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_free_ship_id');

      global.fetch = originalFetch;
    });

    it('returns 500 server error when OrderModel.create throws an unhandled exception', async () => {
      (OrderModel.create as jest.Mock).mockRejectedValue(new Error('Database Connection Lost'));

      const res = await createSession(
        makeRequest({
          body: {
            items: [{ key: '1', name: 'Item', price: 100, quantity: 1 }],
            shippingAddress: { fullName: 'Nafi', address: '123 Main', city: 'NYC' },
          },
        })
      );

      const { status, body } = await parseResponse(res);
      expect(status).toBe(500);
      expect(body.error).toBe('Database Connection Lost');
    });
  });

  /* =========================================================================
   * 4. POST /api/checkout/process-payment (COD / Direct Order Processing)
   * ========================================================================= */
  describe('POST /api/checkout/process-payment', () => {
    it('returns 400 when items array is empty', async () => {
      const res = await processPayment(makeRequest({ body: { items: [] } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toMatch(/Order items are required/i);
    });

    it('returns 400 when shipping address is incomplete', async () => {
      const res = await processPayment(
        makeRequest({
          body: {
            items: [{ key: '1', slug: 'coat', name: 'Coat', price: 200, quantity: 1 }],
            shippingAddress: { fullName: 'Nafi' },
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toMatch(/shipping address is required/i);
    });

    it('processes Cash on Delivery (COD) order successfully', async () => {
      const mockCodOrder = {
        _id: 'ord-cod-1',
        orderNumber: 'VL-COD123',
        items: [{ key: '1', name: 'Pants', price: 80, quantity: 1 }],
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'confirmed',
      };
      (OrderModel.create as jest.Mock).mockResolvedValue(mockCodOrder);

      const res = await processPayment(
        makeRequest({
          body: {
            items: mockCodOrder.items,
            shippingAddress: { fullName: 'Nafi', email: 'nafi@test.com', address: '123 St', city: 'NYC' },
            paymentMethod: 'cod',
          },
        })
      );

      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.orderNumber).toBe('VL-COD123');
      expect(body.data.paymentMethod).toBe('cod');
    });

    it('processes Stripe direct payment successfully when paymentIntentId is provided', async () => {
      (verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-1',
        email: 'nafip82705@hideam.com',
      });

      const mockOrder = {
        _id: 'ord-123',
        orderNumber: 'VL-827051',
        items: [{ key: '1', name: 'Coat', price: 350, quantity: 1 }],
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      };
      (OrderModel.create as jest.Mock).mockResolvedValue(mockOrder);

      const res = await processPayment(
        makeRequest({
          token: 'user-jwt-token',
          body: {
            items: mockOrder.items,
            shippingAddress: {
              fullName: 'Nafi P',
              email: 'nafip82705@hideam.com',
              address: '123 Fashion Ave',
              city: 'New York',
            },
            paymentMethod: 'stripe',
            paymentIntentId: 'pi_test_12345',
          },
        })
      );

      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.orderNumber).toBe('VL-827051');
    });
  });

  /* =========================================================================
   * 5. GET /api/orders/[id] (Order Lookup & Stripe Session Verification)
   * ========================================================================= */
  describe('GET /api/orders/[id]', () => {
    it('returns 400 when order ID parameter is missing', async () => {
      const res = await getOrder(makeRequest(), { params: Promise.resolve({ id: '' }) });
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toMatch(/order id is required/i);
    });

    it('returns 404 when order is not found in database', async () => {
      (OrderModel.findById as jest.Mock).mockResolvedValue(null);

      const res = await getOrder(makeRequest(), { params: Promise.resolve({ id: 'non-existent' }) });
      const { status } = await parseResponse(res);

      expect(status).toBe(404);
    });

    it('returns 200 with order details for valid order without session_id', async () => {
      const mockOrder = {
        orderNumber: 'VL-827051',
        total: 350,
      };
      (OrderModel.findById as jest.Mock).mockResolvedValue(mockOrder);

      const res = await getOrder(makeRequest(), { params: Promise.resolve({ id: 'VL-827051' }) });
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data.orderNumber).toBe('VL-827051');
    });

    it('verifies Stripe session and marks order paid when session_id is provided and payment is paid', async () => {
      const mockPendingOrder = {
        orderNumber: 'VL-999000',
        paymentStatus: 'pending',
        total: 200,
      };
      const mockPaidOrder = {
        ...mockPendingOrder,
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      };

      (OrderModel.findById as jest.Mock).mockResolvedValue(mockPendingOrder);
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_secret_key',
      });
      (OrderModel.updatePaymentStatus as jest.Mock).mockResolvedValue(mockPaidOrder);

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'cs_test_session_abc',
          payment_status: 'paid',
          payment_intent: 'pi_test_intent_abc',
        }),
      } as unknown as Response);

      const req = makeRequest({
        url: 'http://localhost:3000/api/orders/VL-999000?session_id=cs_test_session_abc',
      });

      const res = await getOrder(req, { params: Promise.resolve({ id: 'VL-999000' }) });
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(OrderModel.updatePaymentStatus).toHaveBeenCalledWith(
        'VL-999000',
        'paid',
        'confirmed',
        'pi_test_intent_abc'
      );
      expect(body.data.paymentStatus).toBe('paid');

      global.fetch = originalFetch;
    });

    it('leaves order paymentStatus as pending if Stripe payment_status is unpaid', async () => {
      const mockPendingOrder = {
        orderNumber: 'VL-UNPAID1',
        paymentStatus: 'pending',
        total: 200,
      };

      (OrderModel.findById as jest.Mock).mockResolvedValue(mockPendingOrder);
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_secret_key',
      });

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'cs_test_session_unpaid',
          payment_status: 'unpaid',
        }),
      } as unknown as Response);

      const req = makeRequest({
        url: 'http://localhost:3000/api/orders/VL-UNPAID1?session_id=cs_test_session_unpaid',
      });

      const res = await getOrder(req, { params: Promise.resolve({ id: 'VL-UNPAID1' }) });
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(OrderModel.updatePaymentStatus).not.toHaveBeenCalled();
      expect(body.data.paymentStatus).toBe('pending');

      global.fetch = originalFetch;
    });

    it('handles exception in Stripe API lookup gracefully and still returns order record', async () => {
      const mockPendingOrder = {
        orderNumber: 'VL-ERRORD1',
        paymentStatus: 'pending',
        total: 200,
      };

      (OrderModel.findById as jest.Mock).mockResolvedValue(mockPendingOrder);
      (PaymentMethodModel.getByProvider as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        secretKey: 'sk_test_secret_key',
      });

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error connecting to Stripe'));

      const req = makeRequest({
        url: 'http://localhost:3000/api/orders/VL-ERRORD1?session_id=cs_test_network_error',
      });

      const res = await getOrder(req, { params: Promise.resolve({ id: 'VL-ERRORD1' }) });
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data.orderNumber).toBe('VL-ERRORD1');

      global.fetch = originalFetch;
    });
  });
});
