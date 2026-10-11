import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for AES-GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a consistent 32-byte encryption key from the environment key or session secret.
 */
function getDerivedKey(): Buffer {
  const secretKey =
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.SESSION_SECRET ||
    'comment2dm_fallback_encryption_secret_key_32bytes!';

  // Use scrypt with a static salt to derive exactly 32 bytes for aes-256
  return crypto.scryptSync(secretKey, 'comment2dm_salt_v1', 32);
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts sensitive tokens (e.g. Instagram long-lived user access tokens) using AES-256-GCM.
 * Output format: iv:authTag:encryptedCiphertext (all hex-encoded)
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';

  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an encrypted token previously encrypted with encryptToken.
 * Throws if the ciphertext has been tampered with (GCM authentication failed).
 */
export function decryptToken(encryptedPayload: string): string {
  if (!encryptedPayload) return '';

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format. Expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, cipherHex] = parts;
  const key = getDerivedKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Validates whether token encryption is properly configured and operational.
 */
export function testEncryptionHealth(): boolean {
  try {
    const sample = 'ig_access_token_healthcheck_sample_12345';
    const encrypted = encryptToken(sample);
    const decrypted = decryptToken(encrypted);
    return decrypted === sample;
  } catch (err) {
    console.error('Encryption health check failed:', err);
    return false;
  }
}
