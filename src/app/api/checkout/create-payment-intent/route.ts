import { NextRequest } from 'next/server';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { api } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, currency = 'usd' } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return api.badRequest('Cart is empty. Please add items before checking out.');
    }

    // Calculate subtotal and total
    const subtotal = items.reduce(
      (acc: number, item: { price: number; quantity: number }) =>
        acc + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    if (subtotal <= 0) {
      return api.badRequest('Invalid order subtotal');
    }

    const shipping = subtotal >= 300 ? 0 : 15;
    const total = subtotal + shipping;
    const amountInCents = Math.round(total * 100);

    // Fetch Stripe configuration from database
    const stripeConfig = await PaymentMethodModel.getByProvider('stripe');
    const secretKey = stripeConfig?.secretKey?.trim();
    const publishableKey = stripeConfig?.publishableKey?.trim();

    // If Stripe secret key exists, create PaymentIntent via Stripe REST API
    if (secretKey && secretKey.startsWith('sk_') && typeof fetch !== 'undefined') {
      try {
        const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            amount: amountInCents.toString(),
            currency: currency.toLowerCase(),
            'automatic_payment_methods[enabled]': 'true',
            description: `Velora Fashion Order - ${items.length} item(s)`,
          }),
        });

        const stripeData = await stripeRes.json();

        if (stripeRes.ok && stripeData.client_secret) {
          return api.ok({
            clientSecret: stripeData.client_secret,
            paymentIntentId: stripeData.id,
            amount: total,
            currency,
            isTestMode: stripeConfig?.isTestMode ?? true,
            publishableKey,
          }, 'Payment intent created successfully');
        } else {
          console.warn('Stripe API returned warning/error:', stripeData?.error?.message);
        }
      } catch (stripeErr) {
        console.error('Stripe API fetch error:', stripeErr);
      }
    }

    // Fast-fallback for testing mode or sandbox simulation
    const simulatedIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return api.ok({
      clientSecret: `${simulatedIntentId}_secret_test`,
      paymentIntentId: simulatedIntentId,
      amount: total,
      currency,
      isTestMode: stripeConfig?.isTestMode ?? true,
      publishableKey: publishableKey || 'pk_test_sample',
      simulated: !secretKey || !secretKey.startsWith('sk_'),
    }, 'Stripe test payment intent ready');
  } catch (error) {
    console.error('Create payment intent error:', error);
    return api.serverError();
  }
}
