import type { CreateTagPayload } from '@/types';
import { sanitizeString, slugify } from './common.validation';

export function validateCreateTag(data: CreateTagPayload) {
  const name = sanitizeString(data.name);
  return {
    name,
    slug: data.slug ? sanitizeString(data.slug) : slugify(name),
  };
}

export function validateUpdateTag(data: Partial<CreateTagPayload>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = { ...data, updatedAt: new Date() };
  if (data.name) updateFields.name = sanitizeString(data.name);
  if (data.name && !data.slug) {
    updateFields.slug = slugify(data.name);
  }
  return updateFields;
}
