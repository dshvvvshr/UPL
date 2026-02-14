/**
 * Security Primitives Module
 * 
 * Provides core cryptographic operations aligned with the Core Directive.
 * All operations are designed for security-first approach.
 */

import * as crypto from 'crypto';

export interface HashOptions {
  algorithm?: 'sha256' | 'sha512';
  encoding?: 'hex' | 'base64';
}

export interface EncryptionOptions {
  algorithm?: 'aes-256-gcm';
  keyLength?: number;
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash data using SHA-256 or SHA-512
 */
export function hash(data: string | Buffer, options: HashOptions = {}): string {
  const algorithm = options.algorithm || 'sha256';
  const encoding = options.encoding || 'hex';
  
  const hasher = crypto.createHash(algorithm);
  hasher.update(data);
  
  return hasher.digest(encoding);
}

/**
 * Create HMAC for message authentication
 */
export function createHMAC(
  data: string | Buffer,
  key: string | Buffer,
  algorithm: string = 'sha256'
): string {
  const hmac = crypto.createHmac(algorithm, key);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(
  data: string | Buffer,
  key: Buffer,
  options: EncryptionOptions = {}
): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
  const algorithm = options.algorithm || 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const authTag = cipher.getAuthTag();
  
  return { encrypted, iv, authTag };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(
  encrypted: Buffer,
  key: Buffer,
  iv: Buffer,
  authTag: Buffer,
  algorithm: string = 'aes-256-gcm'
): Buffer {
  const decipher = crypto.createDecipheriv(algorithm, key, iv) as crypto.DecipherGCM;
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
}

/**
 * Generate encryption key from password using PBKDF2
 */
export function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number = 32,
  iterations: number = 600000
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keyLength, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/**
 * Validate input against common security threats
 */
export class Validator {
  /**
   * Check if string contains only safe characters
   */
  static isSafeString(input: string): boolean {
    // Allow alphanumeric, spaces, and common punctuation
    const safePattern = /^[a-zA-Z0-9\s\-_.@]+$/;
    return safePattern.test(input);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Check for potential SQL injection patterns
   */
  static hasSQLInjection(input: string): boolean {
    const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)|(--)|(;)/i;
    return sqlPattern.test(input);
  }

  /**
   * Check for potential XSS patterns
   */
  static hasXSS(input: string): boolean {
    const xssPattern = /<script|javascript:|onerror=|onload=/i;
    return xssPattern.test(input);
  }

  /**
   * Sanitize input by removing dangerous characters
   */
  static sanitize(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
