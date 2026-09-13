import type { CreateTestimonialPayload, UpdateTestimonialPayload } from '@/types/testimonial';
import { sanitizeString, sanitizeNumber, sanitizeBoolean } from './common.validation';

export function validateCreateTestimonial(data: CreateTestimonialPayload) {
  return {
    name: sanitizeString(data.name),
    role: sanitizeString(data.role),
    quote: sanitizeString(data.quote),
    avatar: sanitizeString(data.avatar, ''),
    rating: sanitizeNumber(data.rating, 5, 1, 5),
    reviewCount: sanitizeNumber(data.reviewCount, 0, 0),
    isFeatured: sanitizeBoolean(data.isFeatured, false),
    status: data.status || 'active',
  };
}

export function validateUpdateTestimonial(data: Partial<UpdateTestimonialPayload>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = { updatedAt: new Date() };

  if (data.name !== undefined) updateFields.name = sanitizeString(data.name);
  if (data.role !== undefined) updateFields.role = sanitizeString(data.role);
  if (data.quote !== undefined) updateFields.quote = sanitizeString(data.quote);
  if (data.avatar !== undefined) updateFields.avatar = sanitizeString(data.avatar);
  if (data.rating !== undefined) updateFields.rating = sanitizeNumber(data.rating, 5, 1, 5);
  if (data.reviewCount !== undefined) updateFields.reviewCount = sanitizeNumber(data.reviewCount, 0, 0);
  if (data.isFeatured !== undefined) updateFields.isFeatured = sanitizeBoolean(data.isFeatured);
  if (data.status !== undefined) updateFields.status = data.status;

  return updateFields;
}
