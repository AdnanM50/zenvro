/**
 * Common Validation & Sanitization Utilities
 */

/** Coerces input into a finite number with fallback and optional min/max boundaries */
export function sanitizeNumber(value: unknown, fallback = 0, min?: number, max?: number): number {
  const n = Number(value);
  let result = Number.isFinite(n) ? n : fallback;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

/** Coerces input into a trimmed string with fallback */
export function sanitizeString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.trim();
}

/** Coerces input into a trimmed string or undefined when empty */
export function sanitizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim();
}

/** Coerces input into a boolean value */
export function sanitizeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return fallback;
}

/** Converts a string into a URL-safe slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Sanitizes array of strings or comma-separated string */
export function sanitizeStringList(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
