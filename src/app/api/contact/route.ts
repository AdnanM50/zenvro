import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ContactMessageModel } from '@/models/contact-message.model';
import { sendContactNotification } from '@/lib/mail';
import { api } from '@/lib/api-response';
import { validateContactPayload } from '@/middlewares';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationError = validateContactPayload(body);
    if (validationError) return validationError;

    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return api.badRequest('Name is required');
    }

    if (message.trim().length > 5000) {
      return api.badRequest('Message cannot exceed 5000 characters');
    }

    if (typeof subject === 'string' && subject.trim().length > 200) {
      return api.badRequest('Subject cannot exceed 200 characters');
    }

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
