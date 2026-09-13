import type { CategoryFormData } from '@/types/category';
import { sanitizeString, sanitizeBoolean, slugify } from './common.validation';

export function validateCreateCategory(data: Partial<CategoryFormData>) {
  const name = sanitizeString(data.name);
  return {
    name,
    slug: data.slug ? sanitizeString(data.slug) : slugify(name),
    description: sanitizeString(data.description, ''),
    image: sanitizeString(data.image, ''),
    parentCategory: data.parentCategory || undefined,
    isActive: sanitizeBoolean(data.isActive, true),
    seo: data.seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
  };
}

export function validateUpdateCategory(data: Partial<CategoryFormData>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = { ...data, updatedAt: new Date() };
  if (data.name) updateFields.name = sanitizeString(data.name);
  if (data.name && !data.slug) {
    updateFields.slug = slugify(data.name);
  }
  return updateFields;
}
