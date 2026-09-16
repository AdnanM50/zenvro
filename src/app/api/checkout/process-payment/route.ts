import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { OrderModel } from '@/models/order.model';
import { api } from '@/lib/api-response';
import type { CreateOrderPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const authUser = token ? verifyAccessToken(token) : null;

    const body: CreateOrderPayload = await request.json();
    const { items, shippingAddress, paymentMethod = 'stripe', paymentIntentId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return api.badRequest('Order items are required');
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
      return api.badRequest('Complete shipping address is required');
    }

    const userEmail = authUser?.email || shippingAddress.email;
    const userId = authUser?.userId;

    const order = await OrderModel.create(
      {
        items,
        shippingAddress: {
          ...shippingAddress,
          email: userEmail,
        },
        paymentMethod,
        paymentIntentId,
      },
      userId,
      userEmail
    );

    return api.created(order, 'Order placed successfully');
  } catch (error) {
    console.error('Process payment error:', error);
    return api.serverError();
  }
}
