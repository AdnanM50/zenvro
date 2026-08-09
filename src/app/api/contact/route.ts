import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ContactMessageModel } from '@/models/contact-message.model';
import { sendContactNotification } from '@/lib/mail';
import { api } from '@/lib/api-response';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return api.badRequest('Name is required');
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return api.badRequest('A valid email address is required');
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return api.badRequest('Message is required');
    }

    if (message.trim().length > 5000) {
      return api.badRequest('Message cannot exceed 5000 characters');
    }

    if (typeof subject === 'string' && subject.trim().length > 200) {
      return api.badRequest('Subject cannot exceed 200 characters');
    }

    // Optional: attach the signed-in user to the message so admins can tell
    // registered users apart from anonymous (unauthorized) visitors.
    let userId: string | undefined;
    let isRegistered = false;

    const token = request.cookies.get('access_token')?.value;
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await UserModel.findById(decoded.userId);
        if (user) {
          userId = user._id;
          isRegistered = true;
        }
      }
    }

    const contactMessage = await ContactMessageModel.create({
      name: name.trim(),
      email: email.trim(),
      subject: typeof subject === 'string' ? subject.trim() : '',
      message: message.trim(),
      userId,
      isRegistered,
    });

    // Best-effort notification to the admin inbox — never fail the request
    // if the mail service is unavailable.
    try {
      await sendContactNotification(contactMessage);
    } catch (mailError) {
      console.error('Contact notification email failed:', mailError);
    }

    return api.created(contactMessage, 'Message sent — we will get back to you within one working day.');
  } catch (error) {
    console.error('Create contact message error:', error);
    return api.serverError();
  }
}
