import nodemailer from 'nodemailer';
import type { Order, OrderStatus } from '@/types/order';
import { SITE_URL } from '@/seo/config';

// Re-use shared transporter or build configured instance
export const orderMailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

function escapeHtml(value: string = ''): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMoney(val: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
}

function getItemImageUrl(image?: string): string {
  if (!image) {
    return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80';
  }
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const base = (SITE_URL || 'https://zenvro.com').replace(/\/$/, '');
  const cleanPath = image.startsWith('/') ? image : `/${image}`;
  return `${base}${cleanPath}`;
}

/**
 * Builds the shared luxury email wrapper matching Velour's brand identity:
 * Clean geometric typography (Manrope/Inter), deep midnight accents (#111315),
 * warm terracotta/crimson badge (#b02f00), and refined borders.
 */
function buildEmailHtml({
  badgeText,
  badgeColor = '#b02f00',
  title,
  subtitle,
  bodyContent,
  order,
  actionButton,
}: {
  badgeText: string;
  badgeColor?: string;
  title: string;
  subtitle?: string;
  bodyContent: string;
  order: Order;
  actionButton?: { label: string; url: string };
}): string {
  const customerName = escapeHtml(
    order.shippingAddress?.fullName || order.userEmail.split('@')[0] || 'Valued Customer'
  );
  const orderNumber = escapeHtml(order.orderNumber);
  const items = order.items || [];
  const siteHomeUrl = SITE_URL || 'https://zenvro.com';

  const itemsHtml = items
    .map((item) => {
      const imgUrl = getItemImageUrl(item.image);
      const name = escapeHtml(item.name || 'Garment');
      const size = escapeHtml(item.size || 'Standard');
      const qty = item.quantity || 1;
      const price = formatMoney(item.price);
      const lineTotal = formatMoney((item.price || 0) * qty);

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; width: 68px; vertical-align: top;">
            <img 
              src="${imgUrl}" 
              alt="${name}" 
              width="58" 
              height="68" 
              style="border-radius: 8px; object-fit: cover; display: block; border: 1px solid #ececec; background-color: #f8f8f8;"
            />
          </td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #f0f0f0; vertical-align: top;">
            <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #111315; margin-bottom: 4px;">
              ${name}
            </div>
            <div style="font-size: 12px; color: #666666;">
              Size: <strong style="color: #222222; text-transform: uppercase;">${size}</strong> &bull; Qty: <strong style="color: #222222;">${qty}</strong>
            </div>
            <div style="font-size: 12px; color: #888888; margin-top: 2px;">
              Unit: ${price}
            </div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: top;">
            <span style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; color: #111315;">
              ${lineTotal}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');

  const shippingFeeStr = order.shipping === 0 ? 'FREE' : formatMoney(order.shipping);
  const subtotalStr = formatMoney(order.subtotal || order.total);
  const totalStr = formatMoney(order.total);

  const address = order.shippingAddress
    ? `
      <div style="background-color: #fafafa; border-radius: 12px; padding: 18px 20px; border: 1px solid #eeeeee; margin-top: 24px;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #888888; margin-bottom: 8px;">
          Shipping Destination
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #111315; margin-bottom: 3px;">
          ${escapeHtml(order.shippingAddress.fullName || '')}
        </div>
        <div style="font-size: 13px; color: #555555; line-height: 1.5;">
          ${escapeHtml(order.shippingAddress.address || '')}<br />
          ${escapeHtml(order.shippingAddress.city || '')}${order.shippingAddress.postalCode ? `, ${escapeHtml(order.shippingAddress.postalCode)}` : ''}<br />
          ${escapeHtml(order.shippingAddress.country || '')}
        </div>
      </div>
    `
    : '';

  const actionButtonHtml = actionButton
    ? `
      <div style="text-align: center; margin: 32px 0 16px;">
        <a 
          href="${actionButton.url}" 
          target="_blank" 
          style="display: inline-block; background: #111315; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; box-shadow: 0 4px 14px rgba(0,0,0,0.15);"
        >
          ${escapeHtml(actionButton.label)} &rarr;
        </a>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #222222;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #111315; padding: 32px 36px; text-align: center;">
              <a href="${siteHomeUrl}" style="text-decoration: none; display: inline-block;">
                <span style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 0.22em; color: #ffffff; text-transform: uppercase;">
                  VELOUR
                </span>
              </a>
              <div style="font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #9ca3af; margin-top: 4px; font-weight: 600;">
                Contemporary Fashion &bull; Independent Atelier
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <!-- Category Badge -->
              <div style="margin-bottom: 14px;">
                <span style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: ${badgeColor};">
                  ${badgeText}
                </span>
              </div>

              <!-- Title -->
              <h1 style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 900; letter-spacing: -0.03em; color: #111315; margin: 0 0 12px; line-height: 1.25;">
                ${title}
              </h1>

              ${
                subtitle
                  ? `<div style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 24px;">${subtitle}</div>`
                  : ''
              }

              <!-- Reference Badge Bar -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 14px 18px; border: 1px solid #f3f4f6; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="left">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af;">Order Reference</div>
                      <div style="font-family: 'Manrope', monospace; font-size: 15px; font-weight: 900; color: #111315; margin-top: 2px;">
                        #${orderNumber}
                      </div>
                    </td>
                    <td align="right">
                      <span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; background-color: #f3f4f6; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${escapeHtml(order.paymentMethod || 'Stripe')} Gateway
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Message / Dynamic Body -->
              <div style="font-size: 14px; line-height: 1.7; color: #374151; margin-bottom: 28px;">
                ${bodyContent}
              </div>

              <!-- Items Breakdown Table -->
              <div style="margin-top: 28px;">
                <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #111315; margin-bottom: 12px; border-bottom: 2px solid #111315; padding-bottom: 6px;">
                  Selected Garments (${items.length})
                </div>
                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  ${itemsHtml}
                </table>
              </div>

              <!-- Cost Summary -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111315;">${subtotalStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Express Shipping</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111315;">${shippingFeeStr}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 900; color: #111315; border-top: 1px solid #e5e7eb;">Total</td>
                  <td align="right" style="padding: 12px 0 0; font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 900; color: #111315; border-top: 1px solid #e5e7eb;">${totalStr}</td>
                </tr>
              </table>

              ${address}

              ${actionButtonHtml}

              <!-- Humble Signoff -->
              <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #f3f4f6; font-size: 13px; color: #6b7280; line-height: 1.6;">
                <p style="margin: 0 0 4px;">With highest regards and humble gratitude,</p>
                <p style="margin: 0; font-family: 'Manrope', sans-serif; font-weight: 800; color: #111315;">
                  The VELOUR Atelier &amp; Concierge Team
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 24px 36px; text-align: center;">
              <p style="font-size: 11px; color: #9ca3af; margin: 0 0 6px; line-height: 1.5;">
                Have questions or need alterations? Simply reply directly to this email.<br />
                Our studio concierge will personally assist you.
              </p>
              <p style="font-size: 10px; color: #d1d5db; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">
                &copy; 2026 VELOUR Apparel Group Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Order Confirmed / Payment Succeeded Email
 */
export async function sendOrderSuccessEmail(order: Order): Promise<void> {
  const recipient = order.shippingAddress?.email || order.userEmail;
  if (!recipient) return;

  const customerName = escapeHtml(
    order.shippingAddress?.fullName || order.userEmail.split('@')[0] || 'valued customer'
  );

  const bodyContent = `
    <p style="margin: 0 0 14px;">
      Dear <strong>${customerName}</strong>,
    </p>
    <p style="margin: 0 0 14px;">
      Thank you so very much for choosing VELOUR. We are truly honored that you have chosen VELOUR, and genuinely humbled by your trust in our craftsmanship and curated silhouettes.
    </p>
    <p style="margin: 0 0 14px;">
      Your payment has been successfully confirmed, and your order <strong>#${escapeHtml(order.orderNumber)}</strong> is officially registered. Our atelier artisans have been notified and are preparing your selected pieces with meticulous care.
    </p>
    <p style="margin: 0;">
      We will notify you immediately once your package is hand-inspected and dispatched for delivery.
    </p>
  `;

  const html = buildEmailHtml({
    badgeText: '{"// ORDER CONFIRMATION"}',
    badgeColor: '#10b981', // emerald
    title: 'Thank You for Your Order',
    subtitle: 'Your payment was successfully received and your pieces are being prepared.',
    bodyContent,
    order,
    actionButton: {
      label: 'View Order in Studio Bag',
      url: `${SITE_URL || 'https://zenvro.com'}/user-dashboard`,
    },
  });

  await orderMailTransporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER || 'no-reply@zenvro.com'}>`,
    to: recipient,
    subject: `Order Confirmed: #${order.orderNumber} | VELOUR`,
    html,
  });
}

/**
 * 2. Payment Failed / Interrupted Email
 */
export async function sendPaymentFailedEmail(
  order: Order,
  customNote?: string
): Promise<void> {
  const recipient = order.shippingAddress?.email || order.userEmail;
  if (!recipient) return;

  const customerName = escapeHtml(
    order.shippingAddress?.fullName || order.userEmail.split('@')[0] || 'valued customer'
  );

  const retryUrl = `${SITE_URL || 'https://zenvro.com'}/checkout/failed?orderNumber=${encodeURIComponent(order.orderNumber)}`;

  const bodyContent = `
    <p style="margin: 0 0 14px;">
      Dear <strong>${customerName}</strong>,
    </p>
    <p style="margin: 0 0 14px;">
      We are writing to humbly let you know that we were unable to complete the payment for your recent order <strong>#${escapeHtml(order.orderNumber)}</strong>.
    </p>
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 14px 18px; margin: 18px 0; color: #991b1b; font-size: 13px; line-height: 1.6;">
      <strong>Payment Status Notice:</strong> Your card has not been billed. If any pending pre-authorization appears on your banking statement, it will automatically expire and be released by your issuing bank.
      ${customNote ? `<div style="margin-top: 8px; font-style: italic;">&ldquo;${escapeHtml(customNote)}&rdquo;</div>` : ''}
    </div>
    <p style="margin: 0 0 14px;">
      To ensure you do not miss out on your items, we have placed your selected garments on a temporary reservation. You may easily re-attempt checkout whenever you are ready.
    </p>
    <p style="margin: 0;">
      If you experienced any unexpected errors, need an alternate payment arrangement, or have any questions whatsoever, please reply directly to this email — our team is here to assist you with pleasure.
    </p>
  `;

  const html = buildEmailHtml({
    badgeText: '{"// PAYMENT ATTENTION"}',
    badgeColor: '#ef4444', // red
    title: 'Payment Unsuccessful for Order',
    subtitle: 'No charge was incurred. Your selected garments have been temporarily reserved.',
    bodyContent,
    order,
    actionButton: {
      label: 'Complete Your Payment',
      url: retryUrl,
    },
  });

  await orderMailTransporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER || 'no-reply@zenvro.com'}>`,
    to: recipient,
    subject: `Payment Unsuccessful for Order #${order.orderNumber} | VELOUR`,
    html,
  });
}

/**
 * 3. Status Changed (Processing, Confirmed, Shipped, Delivered)
 */
export async function sendOrderStatusUpdateEmail(
  order: Order,
  newStatus: OrderStatus,
  previousStatus?: OrderStatus
): Promise<void> {
  const recipient = order.shippingAddress?.email || order.userEmail;
  if (!recipient) return;

  const customerName = escapeHtml(
    order.shippingAddress?.fullName || order.userEmail.split('@')[0] || 'valued customer'
  );

  let statusTitle = `Order Status: ${newStatus.toUpperCase()}`;
  let statusBadge = `{"// STATUS: ${newStatus.toUpperCase()}"}`;
  let statusBadgeColor = '#6366f1';
  let detailedDescription = '';

  switch (newStatus) {
    case 'processing':
      statusTitle = 'Your Garments Are Being Prepared';
      statusBadge = '{"// FULFILLMENT: PROCESSING"}';
      statusBadgeColor = '#8b5cf6';
      detailedDescription = `
        Our atelier team is currently inspecting, preparing, and packaging each of your pieces with high-standard garment handling. Every stitch and seam undergoes careful quality review prior to final dispatch.
      `;
      break;

    case 'confirmed':
      statusTitle = 'Your Order Has Been Confirmed';
      statusBadge = '{"// FULFILLMENT: CONFIRMED"}';
      statusBadgeColor = '#3b82f6';
      detailedDescription = `
        Your order is confirmed and prioritized in our atelier fulfillment queue. Our logistics specialists are coordinating delivery arrangements.
      `;
      break;

    case 'shipped':
      statusTitle = 'Your Package Has Been Dispatched';
      statusBadge = '{"// DISPATCHED & IN TRANSIT"}';
      statusBadgeColor = '#0284c7';
      detailedDescription = `
        Great news! Your package has departed our studio and is in active transit with our premium courier service. It is now on its way to your designated shipping destination.
      `;
      break;

    case 'delivered':
      statusTitle = 'Your Package Has Arrived';
      statusBadge = '{"// DELIVERY COMPLETE"}';
      statusBadgeColor = '#10b981';
      detailedDescription = `
        Our courier records confirm that your package has been delivered. We sincerely hope your new pieces exceed all your expectations and integrate seamlessly into your wardrobe. It has been an absolute privilege to craft these pieces for you. If anything is less than absolute perfection, our team is at your complete service.
      `;
      break;

    default:
      detailedDescription = `The fulfillment status of your order has been updated to: <strong>${escapeHtml(newStatus)}</strong>.`;
  }

  const bodyContent = `
    <p style="margin: 0 0 14px;">
      Dear <strong>${customerName}</strong>,
    </p>
    <p style="margin: 0 0 14px;">
      We wanted to respectfully keep you informed regarding the progress of your order <strong>#${escapeHtml(order.orderNumber)}</strong>.
    </p>
    <div style="background-color: #f8fafc; border-left: 4px solid ${statusBadgeColor}; border-radius: 8px; padding: 16px 20px; margin: 18px 0; color: #1e293b; font-size: 13px; line-height: 1.6;">
      ${detailedDescription}
    </div>
    <p style="margin: 0;">
      Thank you endlessly for your gracious patience and support of independent fashion design.
    </p>
  `;

  const html = buildEmailHtml({
    badgeText: statusBadge,
    badgeColor: statusBadgeColor,
    title: statusTitle,
    subtitle: `Update for order #${escapeHtml(order.orderNumber)}`,
    bodyContent,
    order,
    actionButton: {
      label: 'Track Order in Account',
      url: `${SITE_URL || 'https://zenvro.com'}/user-dashboard`,
    },
  });

  await orderMailTransporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER || 'no-reply@zenvro.com'}>`,
    to: recipient,
    subject: `Order Update: #${order.orderNumber} is now ${newStatus.toUpperCase()} | VELOUR`,
    html,
  });
}

/**
 * 4. Order Cancelled Email with Reason
 */
export async function sendOrderCancellationEmail(
  order: Order,
  cancellationReason: string
): Promise<void> {
  const recipient = order.shippingAddress?.email || order.userEmail;
  if (!recipient) return;

  const customerName = escapeHtml(
    order.shippingAddress?.fullName || order.userEmail.split('@')[0] || 'valued customer'
  );

  const cleanReason = cancellationReason?.trim() || 'Order cancellation processed upon administrative review.';

  const bodyContent = `
    <p style="margin: 0 0 14px;">
      Dear <strong>${customerName}</strong>,
    </p>
    <p style="margin: 0 0 14px;">
      We are writing to you with our deepest and most sincere apologies to inform you that order <strong>#${escapeHtml(order.orderNumber)}</strong> has been cancelled.
    </p>
    <p style="margin: 0 0 14px;">
      We deeply value your time and patronage, and we understand that having an order cancelled is disappointing. We truly regret any frustration this may have caused you.
    </p>

    <!-- Prominent Reason Box -->
    <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 12px; padding: 18px 22px; margin: 20px 0;">
      <div style="font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #be123c; margin-bottom: 6px;">
        Reason Provided by Atelier Fulfillment Team
      </div>
      <div style="font-size: 14px; font-style: italic; color: #111315; line-height: 1.6;">
        &ldquo;${escapeHtml(cleanReason)}&rdquo;
      </div>
    </div>

    <div style="background-color: #f9fafb; border-radius: 10px; padding: 14px 18px; margin: 18px 0; border: 1px solid #f3f4f6; font-size: 13px; color: #4b5563; line-height: 1.6;">
      <strong style="color: #111315;">Refund Information:</strong> If you have already been charged, a complete and full refund has been initiated to your original payment method. Depending on your financial institution, this credit typically reflects on your statement within <strong>3 to 5 business days</strong>.
    </div>

    <p style="margin: 0;">
      Should you wish to select an alternative piece, or if you have any questions or feedback for our team, please simply reply directly to this email. A senior member of our concierge staff will be honored to assist you personally.
    </p>
  `;

  const html = buildEmailHtml({
    badgeText: '{"// ORDER NOTICE: CANCELLED"}',
    badgeColor: '#e11d48', // rose / crimson
    title: 'Regarding Your Order Cancellation',
    subtitle: `Important cancellation notice for order #${escapeHtml(order.orderNumber)}`,
    bodyContent,
    order,
    actionButton: {
      label: 'Explore Our Collection',
      url: `${SITE_URL || 'https://zenvro.com'}/#products`,
    },
  });

  await orderMailTransporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER || 'no-reply@zenvro.com'}>`,
    to: recipient,
    subject: `Important: Regarding your VELOUR order #${order.orderNumber}`,
    html,
  });
}

/**
 * 5. Order Refund Email
 */
export async function sendOrderRefundEmail(
  order: Order,
  refundAmount: number,
  reason?: string
): Promise<void> {
  const recipient = order.shippingAddress?.email || order.userEmail;
  if (!recipient) return;

  const customerName = escapeHtml(
    order.shippingAddress?.fullName || order.userEmail.split('@')[0] || 'valued customer'
  );

  const formattedRefund = formatMoney(refundAmount);
  const cardDetails = order.paymentDetails;
  let destinationText = 'Your original payment method';
  if (cardDetails?.cardBrand && cardDetails?.last4) {
    destinationText = `${cardDetails.cardBrand.toUpperCase()} ending in •••• ${cardDetails.last4}`;
    if (cardDetails.bankName) destinationText += ` (${cardDetails.bankName})`;
  } else if (cardDetails?.bankName) {
    destinationText = `${cardDetails.bankName}${cardDetails.bankAccountNumber ? ` (${cardDetails.bankAccountNumber})` : ''}`;
  }

  const bodyContent = `
    <p style="margin: 0 0 14px;">
      Dear <strong>${customerName}</strong>,
    </p>
    <p style="margin: 0 0 14px;">
      We wanted to respectfully inform you that a refund of <strong>${formattedRefund}</strong> has been successfully processed for your order <strong>#${escapeHtml(order.orderNumber)}</strong>.
    </p>

    <!-- Refund Info Card -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 12px; padding: 18px 22px; margin: 20px 0;">
      <div style="font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #15803d; margin-bottom: 6px;">
        Refund Credit Confirmation
      </div>
      <div style="font-size: 15px; font-weight: 800; color: #111315; margin-bottom: 6px;">
        Amount Refunded: ${formattedRefund}
      </div>
      <div style="font-size: 13px; color: #374151;">
        Destination: <strong>${escapeHtml(destinationText)}</strong>
      </div>
      ${
        reason
          ? `<div style="font-size: 12px; font-style: italic; color: #4b5563; margin-top: 8px;">
               Note: &ldquo;${escapeHtml(reason)}&rdquo;
             </div>`
          : ''
      }
    </div>

    <div style="background-color: #f9fafb; border-radius: 10px; padding: 14px 18px; margin: 18px 0; border: 1px solid #f3f4f6; font-size: 13px; color: #4b5563; line-height: 1.6;">
      <strong style="color: #111315;">Processing Timeline:</strong> Depending on your card issuer or banking institution, this refund will appear on your statement within <strong>3 to 5 business days</strong>.
    </div>

    <p style="margin: 0;">
      We sincerely thank you for your patience and understanding. If we can assist you with an alternative garment, size recommendation, or any other request, our concierge team is at your complete disposal.
    </p>
  `;

  const html = buildEmailHtml({
    badgeText: '{"// PAYMENT NOTICE: REFUND"}',
    badgeColor: '#0284c7', // sky
    title: 'Refund Processed Successfully',
    subtitle: `Credit confirmation for order #${escapeHtml(order.orderNumber)}`,
    bodyContent,
    order,
    actionButton: {
      label: 'View Order in Studio Bag',
      url: `${SITE_URL || 'https://zenvro.com'}/user-dashboard`,
    },
  });

  await orderMailTransporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER || 'no-reply@zenvro.com'}>`,
    to: recipient,
    subject: `Refund Confirmation: Order #${order.orderNumber} | VELOUR`,
    html,
  });
}

