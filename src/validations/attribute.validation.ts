import type { CreateAttributePayload } from '@/types/attribute';
import { sanitizeString, sanitizeBoolean } from './common.validation';

export function validateCreateAttribute(data: CreateAttributePayload) {
  return {
    name: sanitizeString(data.name),
    values: Array.isArray(data.values) ? data.values : [],
    useForVariants: sanitizeBoolean(data.useForVariants, true),
    isVariant: sanitizeBoolean(data.isVariant, true),
  };
}

export function validateUpdateAttribute(data: Partial<CreateAttributePayload>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = { ...data, updatedAt: new Date() };
  if (data.name) updateFields.name = sanitizeString(data.name);
  return updateFields;
}
