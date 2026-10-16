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

    // Asynchronously dispatch confirmation email
    try {
      const { sendOrderSuccessEmail } = await import('@/lib/mail');
      await sendOrderSuccessEmail(order);
    } catch (mailErr) {
      console.error('Failed to dispatch order confirmation email on process-payment:', mailErr);
    }

    // Real-time admin notifications via Socket.IO
    try {
      const { createAndDispatchNotification } = await import('@/lib/notifications');
      // 1. Order Notification
      await createAndDispatchNotification({
        type: 'order',
        title: `New Order #${order.orderNumber}`,
        message: `${order.shippingAddress?.fullName || 'Customer'} placed an order of $${order.total.toFixed(2)} (${order.items?.length || 1} items)`,
        link: '/admin/orders',
        metadata: { orderId: order.orderNumber, total: order.total },
      });

      // 2. Payment Notification
      if (order.paymentStatus === 'paid') {
        await createAndDispatchNotification({
          type: 'payment',
          title: `Payment Received: #${order.orderNumber}`,
          message: `Payment of $${order.total.toFixed(2)} completed successfully via ${order.paymentMethod.toUpperCase()}`,
          link: '/admin/payment-history',
          metadata: { orderId: order.orderNumber, total: order.total },
        });
      }
    } catch (notifErr) {
      console.error('Failed to dispatch order/payment notification:', notifErr);
    }

    return api.created(order, 'Order placed successfully');
  } catch (error) {
    console.error('Process payment error:', error);
    return api.serverError();
  }
}
