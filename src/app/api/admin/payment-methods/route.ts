import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { api } from '@/lib/api-response';
import type { PaymentMethodProvider } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const methods = await PaymentMethodModel.getAll();
    return api.ok(methods, 'Payment methods fetched successfully');
  } catch (error) {
    console.error('Get payment methods error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { provider, ...payload } = body;

    if (!provider) {
      return api.badRequest('Payment method provider is required');
    }

    const validProviders: PaymentMethodProvider[] = ['stripe', 'razorpay', 'paypal', 'cod'];
    if (!validProviders.includes(provider as PaymentMethodProvider)) {
      return api.badRequest('Invalid payment method provider');
    }

    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;

    const updated = await PaymentMethodModel.upsert(provider as PaymentMethodProvider, payload);
    return api.ok(updated, `${updated.name} settings updated successfully`);
  } catch (error) {
    console.error('Update payment method error:', error);
    return api.serverError();
  }
}
