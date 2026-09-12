import { NextRequest, NextResponse } from 'next/server';
import { ContactMessageModel } from '@/models/contact-message.model';
import type { ContactMessage } from '@/types';
import { api } from '@/lib/api-response';

export interface ContactMiddlewareResult {
  contactMessage: ContactMessage;
}

export async function requireContactMessage(
  request: NextRequest,
  messageId?: string
): Promise<ContactMiddlewareResult | NextResponse> {
  const id = messageId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Message ID is required');

  const contactMessage = await ContactMessageModel.findById(id);
  if (!contactMessage) return api.notFound('Contact message not found');

  return { contactMessage };
}

export function validateContactPayload(data: Record<string, unknown>): NextResponse | null {
  if ('email' in data && (typeof data.email !== 'string' || !data.email.includes('@'))) {
    return api.badRequest('Valid email is required');
  }

  if ('message' in data && (!data.message || typeof data.message !== 'string' || !data.message.trim())) {
    return api.badRequest('Message body is required');
  }

  return null;
}
