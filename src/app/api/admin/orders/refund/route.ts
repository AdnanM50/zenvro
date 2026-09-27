import { NextRequest, NextResponse } from 'next/server';
import { OrderModel } from '@/models/order.model';
import { PaymentMethodModel } from '@/models/payment-method.model';
import { sendOrderRefundEmail } from '@/lib/mail';
import type { Order, PaymentDetails } from '@/types/order';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      amount,
      reason = 'Refund processed upon administrative review.',
      bankName,
      bankAccountNumber,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.paymentStatus === 'refunded') {
      return NextResponse.json(
        { success: false, error: 'Order is already fully refunded' },
        { status: 400 }
      );
    }

    const refundAmount =
      typeof amount === 'number' && amount > 0 && amount <= order.total
        ? amount
        : order.total;

    let refundId = `re_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // If Stripe payment intent is present, call Stripe Refunds API
    if (order.paymentIntentId && order.paymentIntentId.startsWith('pi_')) {
      try {
        const stripeConfig = await PaymentMethodModel.getByProvider('stripe');
        const secretKey = stripeConfig?.secretKey?.trim();

        if (secretKey && secretKey.startsWith('sk_')) {
          const params = new URLSearchParams();
          params.append('payment_intent', order.paymentIntentId);
          params.append('amount', Math.round(refundAmount * 100).toString());
          if (reason) params.append('reason', 'requested_by_customer');

          const stripeRes = await fetch('https://api.stripe.com/v1/refunds', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });

          const stripeData = await stripeRes.json();
          if (stripeRes.ok && stripeData.id) {
            refundId = stripeData.id;
          } else {
            console.warn('Stripe refund API warning:', stripeData?.error?.message);
          }
        }
      } catch (stripeErr) {
        console.error('Failed to trigger Stripe refund API:', stripeErr);
      }
    }

    const updatedPaymentDetails: PaymentDetails = {
      ...(order.paymentDetails || {}),
      refundedAmount: refundAmount,
      refundReason: reason,
      refundedAt: new Date().toISOString(),
      refundId,
      ...(bankName ? { bankName } : {}),
      ...(bankAccountNumber ? { bankAccountNumber } : {}),
    };

    const newPaymentStatus = refundAmount >= order.total ? 'refunded' : 'partially_refunded';

    const updatedOrder = await OrderModel.updatePaymentDetails(
      order.orderNumber,
      updatedPaymentDetails,
      newPaymentStatus
    );

    const finalOrder = updatedOrder || {
      ...order,
      paymentStatus: newPaymentStatus,
      paymentDetails: updatedPaymentDetails,
      updatedAt: new Date().toISOString(),
    };

    // Disptach humble refund receipt email
    try {
      await sendOrderRefundEmail(finalOrder, refundAmount, reason);
    } catch (mailErr) {
      console.error('Failed to dispatch refund notification email:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Refund of $${refundAmount.toFixed(2)} processed successfully`,
      data: finalOrder,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to process refund';
    console.error('Refund processing error:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
