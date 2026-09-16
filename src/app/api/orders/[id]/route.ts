import { NextRequest } from 'next/server';
import { OrderModel } from '@/models/order.model';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { api } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) return api.badRequest('Order ID is required');

    let order = await OrderModel.findById(id);
    if (!order) return api.notFound('Order not found');

    // Check if session_id is provided to verify with Stripe hosted checkout
    let sessionId: string | null = null;
    try {
      if (request.nextUrl?.searchParams) {
        sessionId = request.nextUrl.searchParams.get('session_id');
      } else if (request.url) {
        const parsedUrl = new URL(request.url, 'http://localhost');
        sessionId = parsedUrl.searchParams.get('session_id');
      }
    } catch {
      // ignore URL parsing error in mock environments
    }
    if (sessionId && sessionId.startsWith('cs_') && order.paymentStatus !== 'paid') {
      try {
        const stripeConfig = await PaymentMethodModel.getByProvider('stripe');
        const secretKey = stripeConfig?.secretKey?.trim();

        if (secretKey) {
          const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
            headers: {
              Authorization: `Bearer ${secretKey}`,
            },
          });
          const session = await res.json();

          if (session && session.payment_status === 'paid') {
            const updated = await OrderModel.updatePaymentStatus(
              order.orderNumber,
              'paid',
              'confirmed',
              (typeof session.payment_intent === 'string' ? session.payment_intent : session.id)
            );
            if (updated) {
              order = updated;
            }
          }
        }
      } catch (stripeErr) {
        console.error('Failed to verify Stripe session in order lookup:', stripeErr);
      }
    }

    return api.ok(order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order error:', error);
    return api.serverError();
  }
}

