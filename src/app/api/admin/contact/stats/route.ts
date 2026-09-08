import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { ContactMessageModel } from '@/models/contact-message.model';
import { api } from '@/lib/api-response';
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const stats = await ContactMessageModel.countByStatus();
    return api.ok(stats, 'Contact message stats fetched');
  } catch (error) {
    console.error('Get contact message stats error:', error);
    return api.serverError();
  }
}
