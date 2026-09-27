import { NextRequest } from 'next/server';
import { OrderModel } from '@/models/order.model';
import { api } from '@/lib/api-response';
import { sendPaymentFailedEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, reason } = body;

    if (!orderNumber) {
      return api.badRequest('orderNumber is required');
    }

    const order = await OrderModel.findById(orderNumber);
    if (!order) {
      return api.notFound('Order not found');
    }

    // Only update and email if not already marked failed or paid
    if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'failed') {
      const updated = await OrderModel.updatePaymentStatus(orderNumber, 'failed');
      const targetOrder = updated || order;

      try {
        await sendPaymentFailedEmail(
          targetOrder,
          reason || 'Card authorization could not be completed.'
        );
      } catch (mailErr) {
        console.error('Failed to send payment failed email:', mailErr);
      }

      return api.ok(
        targetOrder,
        'Payment status marked as failed and notification dispatched.'
      );
    }

    return api.ok(order, 'Order status already recorded');
  } catch (error) {
    console.error('Payment failed notification error:', error);
    return api.serverError();
  }
}
