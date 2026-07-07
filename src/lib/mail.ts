import nodemailer from 'nodemailer';

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
