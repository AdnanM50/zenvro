import { NextResponse } from 'next/server';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { api } from '@/lib/api-response';

export async function GET() {
  try {
    const methods = await PaymentMethodModel.getAll();

    const stripeMethod = methods.find((m) => m.provider === 'stripe');
    const razorpayMethod = methods.find((m) => m.provider === 'razorpay');
    const codMethod = methods.find((m) => m.provider === 'cod');

    const clientConfig = {
      stripe: {
        isEnabled: stripeMethod?.isEnabled ?? true,
        isTestMode: stripeMethod?.isTestMode ?? true,
        publishableKey: stripeMethod?.publishableKey || '',
      },
      razorpay: {
        isEnabled: razorpayMethod?.isEnabled ?? false,
        isTestMode: razorpayMethod?.isTestMode ?? true,
        keyId: razorpayMethod?.keyId || '',
      },
      cod: {
        isEnabled: codMethod?.isEnabled ?? true,
      },
    };

    return api.ok(clientConfig, 'Payment gateway configuration fetched');
  } catch (error) {
    console.error('Get payment config error:', error);
    return api.serverError();
  }
}
