import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { OrderModel } from '@/models/order.model';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { api } from '@/lib/api-response';
import type { OrderItem, ShippingAddress } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const authUser = token ? verifyAccessToken(token) : null;

    const body = await request.json();
    const { items, shippingAddress, currency = 'usd' } = body as {
      items: OrderItem[];
      shippingAddress: ShippingAddress;
      currency?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return api.badRequest('Cart is empty. Please add items to checkout.');
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
      return api.badRequest('Complete shipping address is required');
    }

    const userEmail = authUser?.email || shippingAddress.email;
    const userId = authUser?.userId;

    // 1. Pre-create order record with status 'pending'
    const order = await OrderModel.create(
      {
        items,
        shippingAddress: {
          ...shippingAddress,
          email: userEmail,
        },
        paymentMethod: 'stripe',
      },
      userId,
      userEmail
    );

    // 2. Fetch admin configured Stripe secret key
    const stripeConfig = await PaymentMethodModel.getByProvider('stripe');
    const secretKey = stripeConfig?.secretKey?.trim();

    if (!secretKey || !secretKey.startsWith('sk_')) {
      return api.badRequest('Stripe payment is not properly configured by admin. Secret key is missing or invalid.');
    }

    // 3. Build Stripe Checkout Session
    const origin = request.headers.get('origin') || request.nextUrl.origin || 'http://localhost:3000';

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('payment_method_types[0]', 'card');
    params.append('customer_email', userEmail);
    params.append('client_reference_id', order.orderNumber);
    params.append('success_url', `${origin}/checkout/success?orderNumber=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${origin}/checkout/failed?orderNumber=${order.orderNumber}`);

    // Add line items
    items.forEach((item, index) => {
      params.append(`line_items[${index}][price_data][currency]`, currency.toLowerCase());
      params.append(`line_items[${index}][price_data][unit_amount]`, Math.round(item.price * 100).toString());
      params.append(`line_items[${index}][price_data][product_data][name]`, item.name);
      if (item.category) {
        params.append(`line_items[${index}][price_data][product_data][description]`, `Size: ${item.size} | Category: ${item.category}`);
      }
      if (item.image && item.image.startsWith('http')) {
        params.append(`line_items[${index}][price_data][product_data][images][0]`, item.image);
      }
      params.append(`line_items[${index}][quantity]`, item.quantity.toString());
    });

    // Add shipping fee if applicable
    if (order.shipping > 0) {
      const shipIndex = items.length;
      params.append(`line_items[${shipIndex}][price_data][currency]`, currency.toLowerCase());
      params.append(`line_items[${shipIndex}][price_data][unit_amount]`, Math.round(order.shipping * 100).toString());
      params.append(`line_items[${shipIndex}][price_data][product_data][name]`, 'Standard Express Shipping');
      params.append(`line_items[${shipIndex}][quantity]`, '1');
    }

    // Call Stripe API
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const stripeData = await stripeRes.json();

    if (!stripeRes.ok || !stripeData.url) {
      console.error('Stripe session creation error:', stripeData);
      return api.badRequest(stripeData?.error?.message || 'Failed to create Stripe checkout session');
    }

    // Update order with payment session id
    await OrderModel.updatePaymentStatus(order.orderNumber, 'pending');

    return api.ok({
      url: stripeData.url,
      sessionId: stripeData.id,
      orderNumber: order.orderNumber,
    }, 'Stripe checkout session created');
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return api.serverError(error?.message || 'Internal server error');
  }
}
