import { hash, encrypt, decrypt, generateSecureRandom, Validator } from '../../src/security/crypto';
import * as crypto from 'crypto';

describe('Security Crypto Module', () => {
  describe('generateSecureRandom', () => {
    it('should generate random strings of specified length', () => {
      const random1 = generateSecureRandom(16);
      const random2 = generateSecureRandom(16);
      
      expect(random1).toHaveLength(32); // hex encoding doubles length
      expect(random2).toHaveLength(32);
      expect(random1).not.toBe(random2);
    });
  });

  describe('hash', () => {
    it('should hash data with SHA-256 by default', () => {
      const data = 'test data';
      const hashed = hash(data);
      
      expect(hashed).toBeTruthy();
      expect(hashed).toHaveLength(64); // SHA-256 hex is 64 chars
    });

    it('should produce same hash for same input', () => {
      const data = 'consistent data';
      const hash1 = hash(data);
      const hash2 = hash(data);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = hash('data1');
      const hash2 = hash('data2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const data = 'sensitive information';
      const key = crypto.randomBytes(32);
      
      const { encrypted, iv, authTag } = encrypt(data, key);
      const decrypted = decrypt(encrypted, key, iv, authTag);
      
      expect(decrypted.toString()).toBe(data);
    });

    it('should fail with wrong key', () => {
      const data = 'sensitive information';
      const key1 = crypto.randomBytes(32);
      const key2 = crypto.randomBytes(32);
      
      const { encrypted, iv, authTag } = encrypt(data, key1);
      
      expect(() => {
        decrypt(encrypted, key2, iv, authTag);
      }).toThrow();
    });
  });

  describe('Validator', () => {
    describe('isSafeString', () => {
      it('should accept safe strings', () => {
        expect(Validator.isSafeString('hello123')).toBe(true);
        expect(Validator.isSafeString('user@example.com')).toBe(true);
        expect(Validator.isSafeString('file_name-v2.txt')).toBe(true);
      });

      it('should reject unsafe strings', () => {
        expect(Validator.isSafeString('<script>')).toBe(false);
        expect(Validator.isSafeString('user;DROP TABLE')).toBe(false);
        expect(Validator.isSafeString('name=value&hack')).toBe(false);
      });
    });

    describe('hasSQLInjection', () => {
      it('should detect SQL injection patterns', () => {
        expect(Validator.hasSQLInjection("' OR 1=1--")).toBe(true);
        expect(Validator.hasSQLInjection('SELECT * FROM users')).toBe(true);
        expect(Validator.hasSQLInjection('DROP TABLE users')).toBe(true);
      });

      it('should accept safe input', () => {
        expect(Validator.hasSQLInjection('safe username')).toBe(false);
      });
    });

    describe('hasXSS', () => {
      it('should detect XSS patterns', () => {
        expect(Validator.hasXSS('<script>alert(1)</script>')).toBe(true);
        expect(Validator.hasXSS('javascript:void(0)')).toBe(true);
        expect(Validator.hasXSS('<img onerror=alert(1)>')).toBe(true);
      });

      it('should accept safe input', () => {
        expect(Validator.hasXSS('normal text')).toBe(false);
      });
    });

    describe('sanitize', () => {
      it('should escape HTML special characters', () => {
        const input = '<script>alert("xss")</script>';
        const sanitized = Validator.sanitize(input);
        
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).toContain('&lt;');
        expect(sanitized).toContain('&gt;');
      });
    });
  });
});
