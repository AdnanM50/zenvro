export type PaymentMethodProvider = 'stripe' | 'razorpay' | 'paypal' | 'cod';

export interface PaymentMethodConfig {
  _id?: string;
  provider: PaymentMethodProvider;
  name: string;
  description?: string;
  isEnabled: boolean;
  isTestMode: boolean;
  // Stripe Secrets (2 secret fields requested: Publishable key & Secret key)
  publishableKey?: string;
  secretKey?: string;
  // Razorpay Secrets
  keyId?: string;
  keySecret?: string;
  // PayPal Secrets
  clientId?: string;
  clientSecret?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface UpdatePaymentMethodPayload {
  name?: string;
  description?: string;
  isEnabled?: boolean;
  isTestMode?: boolean;
  publishableKey?: string;
  secretKey?: string;
  keyId?: string;
  keySecret?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface TestPaymentConnectionPayload {
  provider: PaymentMethodProvider;
  isTestMode?: boolean;
  publishableKey?: string;
  secretKey?: string;
  keyId?: string;
  keySecret?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface TestPaymentConnectionResult {
  success: boolean;
  message: string;
  provider: PaymentMethodProvider;
  isTestMode: boolean;
  timestamp: string;
  details?: {
    publishableKeyValid?: boolean;
    secretKeyValid?: boolean;
    keyIdValid?: boolean;
    keySecretValid?: boolean;
    [key: string]: unknown;
  };
}
