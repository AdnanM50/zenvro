process.env.EMAIL_USER = 'concierge@zenvro.com';
process.env.EMAIL_APP_PASSWORD = 'test-app-password';

jest.mock('nodemailer', () => {
  const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'order-mail-test-id' });
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: sendMailMock,
    }),
  };
});

import nodemailer from 'nodemailer';
import {
  sendOrderSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancellationEmail,
  sendOrderRefundEmail,
} from '@/lib/order-emails';
import type { Order } from '@/types/order';

const sendMail = (nodemailer.createTransport as jest.Mock)().sendMail as jest.Mock;

describe('Order Email Templates & Notification System', () => {
  const sampleOrder: Order = {
    _id: 'ord_test_001',
    orderNumber: 'VL-772910384',
    userId: 'usr_123',
    userEmail: 'customer@velora.com',
    items: [
      {
        key: 'coat-m',
        slug: 'studio-hanger-coat',
        name: 'Studio Hanger Coat',
        category: 'Women',
        price: 180.0,
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=400',
        size: 'M',
        quantity: 1,
      },
    ],
    subtotal: 180.0,
    shipping: 15.0,
    total: 195.0,
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingAddress: {
      fullName: 'Genevieve Monet',
      email: 'customer@velora.com',
      address: '742 Evergreen Terrace',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      phone: '+33 1 23 45 67 89',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    sendMail.mockClear();
    sendMail.mockResolvedValue({ messageId: 'order-mail-test-id' });
  });

  describe('1. Order Confirmation Email (sendOrderSuccessEmail)', () => {
    it('dispatches confirmation email with humble wording and item images', async () => {
      await sendOrderSuccessEmail(sampleOrder);

      expect(sendMail).toHaveBeenCalledTimes(1);
      const call = sendMail.mock.calls[0][0];

      expect(call.to).toBe('customer@velora.com');
      expect(call.subject).toContain('Order Confirmed: #VL-772910384');
      expect(call.html).toContain('Genevieve Monet');
      expect(call.html).toContain('VL-772910384');
      expect(call.html).toContain('Studio Hanger Coat');
      expect(call.html).toContain('https://images.unsplash.com/photo-1539533018447-63fcce2678e3');
      expect(call.html).toContain('Size: <strong style="color: #222222; text-transform: uppercase;">M</strong>');
      expect(call.html).toContain('$195.00');
      expect(call.html).toContain('truly honored that you have chosen VELOUR');
      expect(call.html).toContain('The VELOUR Atelier &amp; Concierge Team');
    });

    it('falls back to customer userEmail if shippingAddress email is absent', async () => {
      const orderWithoutShippingEmail: Order = {
        ...sampleOrder,
        shippingAddress: {
          ...sampleOrder.shippingAddress,
          email: '',
        },
      };

      await sendOrderSuccessEmail(orderWithoutShippingEmail);
      expect(sendMail).toHaveBeenCalledTimes(1);
      expect(sendMail.mock.calls[0][0].to).toBe('customer@velora.com');
    });
  });

  describe('2. Payment Failed Email (sendPaymentFailedEmail)', () => {
    it('sends humble payment notice with retry CTA and item reservation note', async () => {
      await sendPaymentFailedEmail(sampleOrder, 'Card authorization declined by issuer');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const call = sendMail.mock.calls[0][0];

      expect(call.to).toBe('customer@velora.com');
      expect(call.subject).toContain('Payment Unsuccessful for Order #VL-772910384');
      expect(call.html).toContain('Payment Status Notice:');
      expect(call.html).toContain('Card authorization declined by issuer');
      expect(call.html).toContain('Your card has not been billed');
      expect(call.html).toContain('checkout/failed?orderNumber=VL-772910384');
      expect(call.html).toContain('Studio Hanger Coat');
    });
  });

  describe('3. Order Status Update Email (sendOrderStatusUpdateEmail)', () => {
    it('sends polite email for processing status', async () => {
      await sendOrderStatusUpdateEmail(sampleOrder, 'processing', 'confirmed');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const call = sendMail.mock.calls[0][0];
      expect(call.subject).toContain('Order Update: #VL-772910384 is now PROCESSING');
      expect(call.html).toContain('Your Garments Are Being Prepared');
      expect(call.html).toContain('inspecting, preparing, and packaging');
    });

    it('sends polite email for shipped status', async () => {
      await sendOrderStatusUpdateEmail(sampleOrder, 'shipped', 'processing');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const call = sendMail.mock.calls[0][0];
      expect(call.subject).toContain('Order Update: #VL-772910384 is now SHIPPED');
      expect(call.html).toContain('Your Package Has Been Dispatched');
      expect(call.html).toContain('departed our studio');
    });

    it('sends polite email for delivered status', async () => {
      await sendOrderStatusUpdateEmail(sampleOrder, 'delivered', 'shipped');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const call = sendMail.mock.calls[0][0];
      expect(call.subject).toContain('Order Update: #VL-772910384 is now DELIVERED');
      expect(call.html).toContain('Your Package Has Arrived');
      expect(call.html).toContain('absolute privilege to craft these pieces for you');
    });
  });

  describe('4. Order Cancellation Email (sendOrderCancellationEmail)', () => {
    it('sends humble apology email featuring admin cancellation reason prominently', async () => {
      const reason = 'Due to high demand, the bespoke wool fabric for this silhouette is temporarily out of stock.';
      await sendOrderCancellationEmail(sampleOrder, reason);

      expect(sendMail).toHaveBeenCalledTimes(1);
      const call = sendMail.mock.calls[0][0];

      expect(call.to).toBe('customer@velora.com');
      expect(call.subject).toContain('Important: Regarding your VELOUR order #VL-772910384');
      expect(call.html).toContain('deepest and most sincere apologies');
      expect(call.html).toContain('Reason Provided by Atelier Fulfillment Team');
      expect(call.html).toContain(reason);
      expect(call.html).toContain('full refund has been initiated');
      expect(call.html).toContain('3 to 5 business days');
    });

    it('escapes dangerous HTML characters in admin cancellation reason', async () => {
      const maliciousReason = 'Item damaged <script>alert("xss")</script> & missing <b>parts</b>';
      await sendOrderCancellationEmail(sampleOrder, maliciousReason);

      const html = sendMail.mock.calls[0][0].html as string;
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(html).toContain('&amp;');
      expect(html).toContain('&lt;b&gt;parts&lt;/b&gt;');
    });
  });

  describe('5. Order Refund Email (sendOrderRefundEmail)', () => {
    it('dispatches refund email with amount, card destination, and bank details', async () => {
      const orderWithCard: Order = {
        ...sampleOrder,
        paymentDetails: {
          cardBrand: 'visa',
          last4: '4242',
          bankName: 'JPMorgan Chase Bank',
          bankAccountNumber: '•••• •••• 9812',
        },
      };

      await sendOrderRefundEmail(orderWithCard, 195.0, 'Customer return accepted');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const call = sendMail.mock.calls[0][0];

      expect(call.to).toBe('customer@velora.com');
      expect(call.subject).toContain('Refund Confirmation: Order #VL-772910384');
      expect(call.html).toContain('$195.00');
      expect(call.html).toContain('VISA ending in •••• 4242');
      expect(call.html).toContain('JPMorgan Chase Bank');
      expect(call.html).toContain('Customer return accepted');
      expect(call.html).toContain('3 to 5 business days');
    });
  });
});
