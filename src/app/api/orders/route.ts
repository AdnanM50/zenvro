import { NextRequest } from 'next/server';
import { requireUser } from '@/middlewares';
import { OrderModel } from '@/models/order.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const orders = await OrderModel.findByUser(auth.user.email, auth.user._id);

    return api.ok(orders, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Get user orders error:', error);
    return api.serverError('Failed to fetch order history');
  }
}
