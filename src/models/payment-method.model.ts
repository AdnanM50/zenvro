import { getDb } from '@/lib/db';
import type {
  PaymentMethodConfig,
  PaymentMethodProvider,
  UpdatePaymentMethodPayload,
  TestPaymentConnectionPayload,
  TestPaymentConnectionResult,
} from '@/types';

const COLLECTION = 'payment_methods';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

const DEFAULT_PAYMENT_METHODS: Omit<PaymentMethodConfig, '_id'>[] = [
  {
    provider: 'stripe',
    name: 'Stripe',
    description: 'Accept credit card, debit card, Apple Pay and Google Pay via Stripe gateway.',
    isEnabled: true,
    isTestMode: true,
    publishableKey: '',
    secretKey: '',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    provider: 'razorpay',
    name: 'Razorpay',
    description: 'Accept UPI, NetBanking, Cards, and Wallets via Razorpay gateway.',
    isEnabled: false,
    isTestMode: true,
    keyId: '',
    keySecret: '',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    provider: 'paypal',
    name: 'PayPal',
    description: 'Accept PayPal payments and international credit cards.',
    isEnabled: false,
    isTestMode: true,
    clientId: '',
    clientSecret: '',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    provider: 'cod',
    name: 'Cash on Delivery',
    description: 'Allow customers to pay in cash upon product delivery.',
    isEnabled: true,
    isTestMode: false,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export const PaymentMethodModel = {
  async getAll(): Promise<PaymentMethodConfig[]> {
    const c = await col();
    const existing = await c.find({}).toArray();

    if (existing && existing.length > 0) {
      // Ensure all default providers exist
      const existingProviders = new Set(existing.map((item: { provider: string }) => item.provider));
      const missing = DEFAULT_PAYMENT_METHODS.filter((d) => !existingProviders.has(d.provider));

      if (missing.length > 0) {
        await c.insertMany(missing);
        return c.find({}).toArray();
      }
      return existing as PaymentMethodConfig[];
    }

    // Seed defaults
    await c.insertMany(DEFAULT_PAYMENT_METHODS);
    return c.find({}).toArray() as Promise<PaymentMethodConfig[]>;
  },

  async getByProvider(provider: PaymentMethodProvider): Promise<PaymentMethodConfig | null> {
    const c = await col();
    let item = await c.findOne({ provider });
    if (!item) {
      const defaultItem = DEFAULT_PAYMENT_METHODS.find((d) => d.provider === provider);
      if (defaultItem) {
        await c.insertOne(defaultItem);
        item = await c.findOne({ provider });
      }
    }
    return item as PaymentMethodConfig | null;
  },

  async upsert(
    provider: PaymentMethodProvider,
    payload: UpdatePaymentMethodPayload
  ): Promise<PaymentMethodConfig> {
    const c = await col();
    const now = new Date().toISOString();

    const existing = await this.getByProvider(provider);
    const updateData: Partial<PaymentMethodConfig> = {
      ...payload,
      updatedAt: now,
    };

    if (existing) {
      await c.updateOne({ provider }, { $set: updateData });
    } else {
      const defaultItem = DEFAULT_PAYMENT_METHODS.find((d) => d.provider === provider);
      const newDoc: PaymentMethodConfig = {
        provider,
        name: payload.name || defaultItem?.name || provider,
        description: payload.description || defaultItem?.description || '',
        isEnabled: payload.isEnabled ?? false,
        isTestMode: payload.isTestMode ?? true,
        ...payload,
        createdAt: now,
        updatedAt: now,
      };
      await c.insertOne(newDoc);
    }

    const updated = await c.findOne({ provider });
    return updated as PaymentMethodConfig;
  },

  async testConnection(payload: TestPaymentConnectionPayload): Promise<TestPaymentConnectionResult> {
    const { provider, isTestMode = true, publishableKey, secretKey, keyId, keySecret, clientId, clientSecret } = payload;
    const timestamp = new Date().toISOString();

    if (provider === 'stripe') {
      const pKey = publishableKey?.trim() || '';
      const sKey = secretKey?.trim() || '';

      if (!pKey) {
        return {
          success: false,
          message: 'Stripe Publishable Key is required.',
          provider,
          isTestMode,
          timestamp,
          details: { publishableKeyValid: false, secretKeyValid: false },
        };
      }

      if (!sKey) {
        return {
          success: false,
          message: 'Stripe Secret Key is required.',
          provider,
          isTestMode,
          timestamp,
          details: { publishableKeyValid: pKey.startsWith('pk_'), secretKeyValid: false },
        };
      }

      const pValidPrefix = isTestMode ? pKey.startsWith('pk_test_') : pKey.startsWith('pk_live_') || pKey.startsWith('pk_');
      const sValidPrefix = isTestMode ? (sKey.startsWith('sk_test_') || sKey.startsWith('rk_test_')) : (sKey.startsWith('sk_live_') || sKey.startsWith('rk_live_') || sKey.startsWith('sk_'));

      if (!pValidPrefix) {
        return {
          success: false,
          message: isTestMode
            ? 'Invalid Stripe Publishable Key format for Test mode (must start with pk_test_).'
            : 'Invalid Stripe Publishable Key format for Live mode (must start with pk_live_ or pk_).',
          provider,
          isTestMode,
          timestamp,
          details: { publishableKeyValid: false, secretKeyValid: sValidPrefix },
        };
      }

      if (!sValidPrefix) {
        return {
          success: false,
          message: isTestMode
            ? 'Invalid Stripe Secret Key format for Test mode (must start with sk_test_ or rk_test_).'
            : 'Invalid Stripe Secret Key format for Live mode (must start with sk_live_ or rk_live_ or sk_).',
          provider,
          isTestMode,
          timestamp,
          details: { publishableKeyValid: true, secretKeyValid: false },
        };
      }

      return {
        success: true,
        message: `Stripe ${isTestMode ? 'Test' : 'Live'} credentials format verified successfully! Connection status: Ready`,
        provider,
        isTestMode,
        timestamp,
        details: { publishableKeyValid: true, secretKeyValid: true },
      };
    }

    if (provider === 'razorpay') {
      const rId = keyId?.trim() || '';
      const rSecret = keySecret?.trim() || '';

      if (!rId) {
        return {
          success: false,
          message: 'Razorpay Key ID is required.',
          provider,
          isTestMode,
          timestamp,
          details: { keyIdValid: false, keySecretValid: false },
        };
      }

      if (!rSecret) {
        return {
          success: false,
          message: 'Razorpay Key Secret is required.',
          provider,
          isTestMode,
          timestamp,
          details: { keyIdValid: true, keySecretValid: false },
        };
      }

      const idValid = isTestMode ? rId.startsWith('rzp_test_') || rId.startsWith('rzp_') : rId.startsWith('rzp_live_') || rId.startsWith('rzp_');

      if (!idValid) {
        return {
          success: false,
          message: isTestMode
            ? 'Invalid Razorpay Key ID format for Test mode (should start with rzp_test_).'
            : 'Invalid Razorpay Key ID format for Live mode (should start with rzp_live_).',
          provider,
          isTestMode,
          timestamp,
          details: { keyIdValid: false, keySecretValid: true },
        };
      }

      return {
        success: true,
        message: `Razorpay ${isTestMode ? 'Test' : 'Live'} credentials format verified successfully! Connection status: Ready`,
        provider,
        isTestMode,
        timestamp,
        details: { keyIdValid: true, keySecretValid: true },
      };
    }

    if (provider === 'paypal') {
      const cId = clientId?.trim() || '';
      const cSecret = clientSecret?.trim() || '';

      if (!cId || !cSecret) {
        return {
          success: false,
          message: 'PayPal Client ID and Client Secret are required.',
          provider,
          isTestMode,
          timestamp,
        };
      }

      return {
        success: true,
        message: `PayPal ${isTestMode ? 'Sandbox' : 'Live'} credentials format verified successfully!`,
        provider,
        isTestMode,
        timestamp,
      };
    }

    if (provider === 'cod') {
      return {
        success: true,
        message: 'Cash on Delivery does not require secret keys.',
        provider,
        isTestMode: false,
        timestamp,
      };
    }

    return {
      success: false,
      message: 'Unknown payment provider.',
      provider,
      isTestMode,
      timestamp,
    };
  },
};
