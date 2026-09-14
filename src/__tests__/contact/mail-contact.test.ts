process.env.EMAIL_USER = 'store@zenvro.com';
process.env.EMAIL_APP_PASSWORD = 'app-password';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn().mockResolvedValue({ messageId: 'ok' }) }),
}));

import nodemailer from 'nodemailer';
import { sendContactReplyEmail, sendContactNotification } from '@/lib/mail';
import type { ContactMessage } from '@/types';

const sendMail = (nodemailer.createTransport as jest.Mock)().sendMail as jest.Mock;

describe('Contact Mail Helpers', () => {
  beforeEach(() => {
    sendMail.mockClear();
    sendMail.mockResolvedValue({ messageId: 'ok' });
  });

  const message: ContactMessage = {
    _id: 'c1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Sizing question',
    message: 'Do you have the SS/26 jacket in XL?',
    isRegistered: false,
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('sends a contact notification to the store inbox', async () => {
    await sendContactNotification(message);

    expect(sendMail).toHaveBeenCalledTimes(1);
    const call = sendMail.mock.calls[0][0];
    expect(call.to).toBe('store@zenvro.com');
    expect(call.from).toContain('store@zenvro.com');
    expect(call.subject).toContain('Sizing question');
    expect(call.html).toContain('Jane Doe');
    expect(call.html).toContain('jane@example.com');
  });

  it('sends a reply to the visitor email with reply-to set to the store', async () => {
    await sendContactReplyEmail(message, 'Thanks for reaching out!');

    expect(sendMail).toHaveBeenCalledTimes(1);
    const call = sendMail.mock.calls[0][0];
    expect(call.to).toBe('jane@example.com');
    expect(call.replyTo).toBe('store@zenvro.com');
    expect(call.subject).toBe('Re: Sizing question');
    expect(call.html).toContain('Thanks for reaching out!');
    expect(call.html).toContain('Jane Doe');
  });

  it('escapes user content to prevent HTML injection', async () => {
    const malicious: ContactMessage = {
      ...message,
      name: '<script>alert(1)</script>',
      subject: '<b>Subject</b>',
    };

    await sendContactReplyEmail(malicious, 'Reply <b>here</b> & now');

    const html = sendMail.mock.calls[0][0].html as string;
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;b&gt;');
    expect(html).toContain('&amp;');
  });

  it('uses a fallback subject when the message has none', async () => {
    await sendContactReplyEmail({ ...message, subject: '' }, 'Hi');

    const call = sendMail.mock.calls[0][0];
    expect(call.subject).toBe('Re: Your message to VELOUR');
  });

  it('propagates mail service errors to the caller', async () => {
    sendMail.mockRejectedValue(new Error('smtp down'));

    await expect(sendContactReplyEmail(message, 'Hi')).rejects.toThrow('smtp down');
  });
});
