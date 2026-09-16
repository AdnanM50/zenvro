import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { api } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    if (!body.provider) {
      return api.badRequest('Provider is required to run test module');
    }

    const result = await PaymentMethodModel.testConnection(body);
    if (!result.success) {
      return api.badRequest(result.message);
    }

    return api.ok(result, result.message);
  } catch (error) {
    console.error('Test payment connection error:', error);
    return api.serverError();
  }
}
