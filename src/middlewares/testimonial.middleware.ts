import { NextRequest, NextResponse } from 'next/server';
import { TestimonialModel } from '@/models/testimonial.model';
import type { Testimonial } from '@/types';
import { api } from '@/lib/api-response';

export interface TestimonialMiddlewareResult {
  testimonial: Testimonial;
}

export async function requireTestimonial(
  request: NextRequest,
  testimonialId?: string
): Promise<TestimonialMiddlewareResult | NextResponse> {
  const id = testimonialId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Testimonial ID is required');

  const testimonial = await TestimonialModel.findById(id);
  if (!testimonial) return api.notFound('Testimonial not found');

  return { testimonial };
}

export function validateTestimonialPayload(data: Record<string, unknown>): NextResponse | null {
  if ('author' in data && (!data.author || typeof data.author !== 'string' || !data.author.trim())) {
    return api.badRequest('Testimonial author is required');
  }

  if ('content' in data && (!data.content || typeof data.content !== 'string' || !data.content.trim())) {
    return api.badRequest('Testimonial content is required');
  }

  return null;
}
