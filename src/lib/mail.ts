import nodemailer from 'nodemailer';
import type { ContactMessage } from '@/types';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP for VELOUR Account Registration',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #f5f5f5; padding: 40px 24px;">
        <div style="background: #ffffff; border-radius: 16px; padding: 40px 32px; text-align: center;">
          <h1 style="font-family: Manrope, sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: -0.04em; color: #1a1c1c; margin: 0 0 8px;">
            VELOUR
          </h1>
          <p style="font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #b02f00; font-weight: 700; margin: 0 0 24px;">
            {"// VERIFICATION"}
          </p>
          <p style="color: #5e5e5e; font-size: 0.875rem; line-height: 1.6; margin: 0 0 24px;">
            Use the OTP below to complete your account registration. This code expires in 5 minutes.
          </p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <span style="font-family: Manrope, sans-serif; font-size: 2.5rem; font-weight: 900; letter-spacing: 0.15em; color: #1a1c1c;">
              ${otp}
            </span>
          </div>
      <p style="color: #777777; font-size: 0.75rem; margin: 0;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendContactNotification(message: ContactMessage): Promise<void> {
  const subject = escapeHtml(message.subject || 'No subject');
  const name = escapeHtml(message.name);
  const email = escapeHtml(message.email);
  const body = escapeHtml(message.message);
  const origin = message.isRegistered ? 'Registered account' : 'Unauthorized (guest) visitor';

  await transporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New contact message: ${subject}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; background: #f5f5f5; padding: 40px 24px;">
        <div style="background: #ffffff; border-radius: 16px; padding: 40px 32px;">
          <h1 style="font-family: Manrope, sans-serif; font-size: 1.5rem; font-weight: 900; letter-spacing: -0.03em; color: #1a1c1c; margin: 0 0 4px;">
            New Contact Message
          </h1>
          <p style="font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #b02f00; font-weight: 700; margin: 0 0 24px;">
            {"// INBOX"}
          </p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 4px;"><strong style="color: #1a1c1c;">${name}</strong> <span style="color: #5e5e5e;">&lt;${email}&gt;</span></p>
            <p style="margin: 0; color: #5e5e5e; font-size: 0.8rem;">Subject: ${subject}</p>
            <p style="margin: 8px 0 0; color: #5e5e5e; font-size: 0.8rem;">Origin: ${origin}</p>
          </div>
          <div style="color: #333; font-size: 0.875rem; line-height: 1.7; white-space: pre-wrap;">${body}</div>
          <p style="color: #777777; font-size: 0.75rem; margin: 24px 0 0;">
            Reply directly from the admin panel — /admin/contact.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendContactReplyEmail(message: ContactMessage, reply: string): Promise<void> {
  const name = escapeHtml(message.name);
  const subject = escapeHtml(message.subject || 'Your message to VELOUR');
  const replyBody = escapeHtml(reply);

  await transporter.sendMail({
    from: `"VELOUR" <${process.env.EMAIL_USER}>`,
    to: message.email,
    replyTo: process.env.EMAIL_USER,
    subject: `Re: ${subject}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #f5f5f5; padding: 40px 24px;">
        <div style="background: #ffffff; border-radius: 16px; padding: 40px 32px;">
          <h1 style="font-family: Manrope, sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: -0.04em; color: #1a1c1c; margin: 0 0 8px;">
            VELOUR
          </h1>
          <p style="font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #b02f00; font-weight: 700; margin: 0 0 24px;">
            {"// REPLY"}
          </p>
          <p style="color: #5e5e5e; font-size: 0.875rem; line-height: 1.6; margin: 0 0 20px;">
            Hi ${name},
          </p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;">
            <p style="margin: 0; color: #333; font-size: 0.875rem; line-height: 1.7; white-space: pre-wrap;">${replyBody}</p>
          </div>
          <p style="color: #5e5e5e; font-size: 0.875rem; line-height: 1.6; margin: 0 0 24px;">
            If you have any other questions, just reply to this email — a real human from the VELOUR team will get back to you.
          </p>
          <p style="color: #777777; font-size: 0.75rem; margin: 0;">
            Best regards,<br />The VELOUR Team
          </p>
        </div>
      </div>
    `,
  });
}
