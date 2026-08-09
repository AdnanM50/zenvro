import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ContactMessageModel } from '@/models/contact-message.model';
import { sendContactReplyEmail } from '@/lib/mail';
import { api } from '@/lib/api-response';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const statusParam = searchParams.get('status') || undefined;
    const status = statusParam === 'new' || statusParam === 'answered' ? statusParam : undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { messages, total } = await ContactMessageModel.findPaginated(page, limit, {
      search,
      status,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(messages, { page, limit, total, totalPages }, 'Contact messages fetched');
  } catch (error) {
    console.error('Get contact messages error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, status, reply } = body;

    if (!_id || typeof _id !== 'string') {
      return api.badRequest('_id is required');
    }

    const existing = await ContactMessageModel.findById(_id);
    if (!existing) {
      return api.notFound('Contact message not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (reply !== undefined) {
      if (typeof reply !== 'string' || !reply.trim()) {
        return api.badRequest('Reply cannot be empty');
      }
      if (reply.trim().length > 10000) {
        return api.badRequest('Reply cannot exceed 10000 characters');
      }

      // Send the reply email to the visitor before persisting it.
      try {
        await sendContactReplyEmail(existing, reply.trim());
      } catch (mailError) {
        console.error('Contact reply email failed:', mailError);
        return api.serverError('Reply could not be emailed. Please try again.');
      }

      updateData.reply = reply.trim();
    }

    if (status !== undefined) {
      if (!['new', 'answered'].includes(status)) {
        return api.badRequest('Status must be new or answered');
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return api.badRequest('No update provided');
    }

    const updated = await ContactMessageModel.update(_id, updateData, auth.admin._id);
    if (!updated) return api.notFound('Contact message not found');

    const message = updateData.reply ? 'Reply sent and message marked as answered' : 'Contact message updated';
    return api.ok(null, message);
  } catch (error) {
    console.error('Update contact message error:', error);
    return api.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) return api.badRequest('_id is required');

    const deleted = await ContactMessageModel.delete(_id);
    if (!deleted) return api.notFound('Contact message not found');

    return api.ok(null, 'Contact message deleted');
  } catch (error) {
    console.error('Delete contact message error:', error);
    return api.serverError();
  }
}
