import { NextRequest, NextResponse } from 'next/server';
import {
  sendOrderSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancellationEmail,
} from '@/lib/mail';
import type { Order, OrderStatus } from '@/types/order';

const SAMPLE_TEST_ORDER: Order = {
  _id: 'test_order_999',
  orderNumber: 'VL-882910471',
  userEmail: 'recipient@example.com',
  items: [
    {
      key: 'studio-coat-m',
      slug: 'studio-hanger-coat',
      name: 'Studio Hanger Wool Coat',
      category: 'Outerwear',
      price: 245.0,
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=400',
      size: 'M',
      quantity: 1,
    },
    {
      key: 'puffer-l',
      slug: 'black-cloud-puffer',
      name: 'Black Cloud Puffer Jacket',
      category: 'Men',
      price: 212.0,
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400',
      size: 'L',
      quantity: 1,
    },
  ],
  subtotal: 457.0,
  shipping: 0.0,
  total: 457.0,
  paymentMethod: 'stripe',
  paymentStatus: 'paid',
  orderStatus: 'confirmed',
  shippingAddress: {
    fullName: 'Alexander Wright',
    email: 'recipient@example.com',
    address: '42 Avenue Montaigne',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    phone: '+33 1 42 68 55 00',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = 'confirmation',
      recipientEmail,
      status = 'shipped',
      reason = 'Atelier fabric replenishment delay for this seasonal silhouette.',
    } = body;

    const targetEmail =
      recipientEmail ||
      process.env.EMAIL_USER ||
      'customer@velora.com';

    const order: Order = {
      ...SAMPLE_TEST_ORDER,
      userEmail: targetEmail,
      shippingAddress: {
        ...SAMPLE_TEST_ORDER.shippingAddress,
        email: targetEmail,
      },
    };

    switch (type) {
      case 'confirmation':
        await sendOrderSuccessEmail(order);
        break;

      case 'payment_failed':
        await sendPaymentFailedEmail(order, reason);
        break;

      case 'status_update':
        await sendOrderStatusUpdateEmail(order, status as OrderStatus);
        break;

      case 'cancellation':
        await sendOrderCancellationEmail(order, reason);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid type. Permitted: 'confirmation', 'payment_failed', 'status_update', 'cancellation'",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test email of type '${type}' successfully dispatched to ${targetEmail}`,
      data: {
        type,
        recipient: targetEmail,
        orderNumber: order.orderNumber,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to dispatch test email';
    console.error('Test email error:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
