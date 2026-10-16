import { NextRequest, NextResponse } from 'next/server';
import { createAndDispatchNotification } from '@/lib/notifications';
import type { NotificationType } from '@/types/notification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const type: NotificationType = body.type || 'order';

    let defaultTitle = 'New Order Placed';
    let defaultMessage = 'Customer placed an order for $189.00 (2 items)';
    let defaultLink = '/admin/orders';

    if (type === 'payment') {
      defaultTitle = 'Payment Confirmed';
      defaultMessage = 'Stripe payment of $249.50 processed successfully';
      defaultLink = '/admin/payment-history';
    } else if (type === 'contact') {
      defaultTitle = 'New Customer Inquiry';
      defaultMessage = 'Adnan: Question regarding bulk order and delivery time';
      defaultLink = '/admin/contact';
    }

    const title = (body.title && typeof body.title === 'string' && body.title.trim())
      ? body.title.trim()
      : defaultTitle;

    const message = (body.message && typeof body.message === 'string' && body.message.trim())
      ? body.message.trim()
      : defaultMessage;

    const link = body.link || defaultLink;

    const notification = await createAndDispatchNotification({
      type,
      title,
      message,
      link,
      metadata: {
        isTest: true,
        timestamp: Date.now(),
        ...(body.metadata || {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: `Test ${type} notification dispatched via Socket.IO`,
    });
  } catch (err) {
    console.error('Test notification error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
