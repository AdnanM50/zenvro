import { PaymentMethodModel } from '@/models/payment-method.model';

describe('PaymentMethodModel Unit Tests', () => {
  describe('testConnection()', () => {
    it('validates missing Stripe Publishable Key', async () => {
      const res = await PaymentMethodModel.testConnection({
        provider: 'stripe',
        isTestMode: true,
        publishableKey: '',
        secretKey: 'sk_test_123',
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/Stripe Publishable Key is required/i);
    });

    it('validates missing Stripe Secret Key', async () => {
      const res = await PaymentMethodModel.testConnection({
        provider: 'stripe',
        isTestMode: true,
        publishableKey: 'pk_test_123',
        secretKey: '',
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/Stripe Secret Key is required/i);
    });

    it('fails when Stripe test publishable key does not start with pk_test_', async () => {
      const res = await PaymentMethodModel.testConnection({
        provider: 'stripe',
        isTestMode: true,
        publishableKey: 'pk_live_123',
        secretKey: 'sk_test_123',
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/must start with pk_test_/i);
    });

    it('passes valid Stripe test credentials', async () => {
      const res = await PaymentMethodModel.testConnection({
        provider: 'stripe',
        isTestMode: true,
        publishableKey: 'pk_test_sampleKey123',
        secretKey: 'sk_test_sampleSecret123',
      });

      expect(res.success).toBe(true);
      expect(res.details?.publishableKeyValid).toBe(true);
      expect(res.details?.secretKeyValid).toBe(true);
    });

    it('validates Razorpay credentials', async () => {
      const failRes = await PaymentMethodModel.testConnection({
        provider: 'razorpay',
        isTestMode: true,
        keyId: '',
        keySecret: 'secret',
      });
      expect(failRes.success).toBe(false);

      const passRes = await PaymentMethodModel.testConnection({
        provider: 'razorpay',
        isTestMode: true,
        keyId: 'rzp_test_12345',
        keySecret: 'secret12345',
      });
      expect(passRes.success).toBe(true);
    });
  });
});
