import type { CreateBrandPayload } from '@/types';
import { sanitizeString, sanitizeBoolean, slugify } from './common.validation';

export function validateCreateBrand(data: CreateBrandPayload) {
  const name = sanitizeString(data.name);
  return {
    name,
    slug: data.slug ? sanitizeString(data.slug) : slugify(name),
    logo: sanitizeString(data.logo, ''),
    description: sanitizeString(data.description, ''),
    seo: data.seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
    isActive: sanitizeBoolean(data.isActive, true),
  };
}

export function validateUpdateBrand(data: Partial<CreateBrandPayload>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = { ...data, updatedAt: new Date() };
  if (data.name) updateFields.name = sanitizeString(data.name);
  if (data.name && !data.slug) {
    updateFields.slug = slugify(data.name);
  }
  return updateFields;
}
