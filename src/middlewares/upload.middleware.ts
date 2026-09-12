import { NextResponse } from 'next/server';
import { api } from '@/lib/api-response';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function validateUploadFile(file: File | null): NextResponse | null {
  if (!file) return api.badRequest('No file provided');
  if (!ALLOWED_TYPES.includes(file.type)) {
    return api.badRequest('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG');
  }
  if (file.size > MAX_SIZE) {
    return api.badRequest('File too large. Maximum size is 5MB');
  }

  return null;
}
