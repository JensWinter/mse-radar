import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { RESPONSE_ENCRYPTION_KEY } from 'astro:env/server';

const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;

export interface ResponseCrypto {
  encryptJson(value: unknown): Buffer;
  decryptJson<T>(blob: Buffer): T;
}

export function createResponseCrypto(key: Buffer): ResponseCrypto {
  if (key.length !== KEY_LEN) {
    throw new Error(
      `Response crypto key must be ${KEY_LEN} bytes, got ${key.length}`,
    );
  }
  return {
    encryptJson(value: unknown): Buffer {
      const iv = randomBytes(IV_LEN);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
      const ciphertext = Buffer.concat([
        cipher.update(plaintext),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();
      return Buffer.concat([iv, tag, ciphertext]);
    },
    decryptJson<T>(blob: Buffer): T {
      const iv = blob.subarray(0, IV_LEN);
      const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
      const ciphertext = blob.subarray(IV_LEN + TAG_LEN);
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return JSON.parse(plaintext.toString('utf8')) as T;
    },
  };
}

let defaultInstance: ResponseCrypto | undefined;

export function getResponseCrypto(): ResponseCrypto {
  if (!defaultInstance) {
    if (!RESPONSE_ENCRYPTION_KEY) {
      throw new Error('RESPONSE_ENCRYPTION_KEY is not set');
    }
    const key = Buffer.from(RESPONSE_ENCRYPTION_KEY, 'base64');
    defaultInstance = createResponseCrypto(key);
  }
  return defaultInstance;
}
