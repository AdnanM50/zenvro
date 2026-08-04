import crypto from 'crypto';

/**
 * Generates a valid 24-character hexadecimal string compatible with MongoDB ObjectId.
 */
export function generateObjectId(): string {
  return crypto.randomBytes(12).toString('hex');
}
