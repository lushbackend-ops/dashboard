import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from the environment secret.
 * Falls back to a deterministic SHA-256 hash if provided string isn't exactly 32 bytes hex.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-change-in-production-32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive tokens (OAuth tokens, refresh tokens) before saving in database.
 * Output format: iv:ciphertext:tag (hex encoded)
 */
export function encryptToken(token: string): string {
  if (!token) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${encrypted}:${tag}`;
}

/**
 * Decrypts tokens when retrieved by server-side adapter execution.
 */
export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return '';
  // Check if it's already in iv:ciphertext:tag format
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    // If not encrypted (e.g. legacy/plain), return as-is
    return encryptedString;
  }
  
  try {
    const [ivHex, cipherHex, tagHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('Failed to decrypt token (check SOCIAL_TOKEN_ENCRYPTION_KEY):', err?.message || err);
    return '';
  }
}
