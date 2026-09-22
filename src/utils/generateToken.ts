import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns A URL-safe base64 encoded token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('base64url');
};

/**
 * Generate a unique verification token for employee QR codes
 * @returns A 48-byte URL-safe token
 */
export const generateVerificationToken = (): string => {
  return generateSecureToken(48);
};
