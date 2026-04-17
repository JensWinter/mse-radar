import { randomBytes } from 'node:crypto';
import { expect, suite, test } from 'vitest';
import { createResponseCrypto } from '@lib/response-crypto.ts';

suite('response-crypto', () => {
  const key = randomBytes(32);
  const crypto = createResponseCrypto(key);

  test('round-trips JSON values', () => {
    const value = [1, 2, null, 7, 3];
    const blob = crypto.encryptJson(value);
    expect(crypto.decryptJson(blob)).toEqual(value);
  });

  test('round-trips comments including null', () => {
    const value = ['hello', null, 'world'];
    const blob = crypto.encryptJson(value);
    expect(crypto.decryptJson(blob)).toEqual(value);
  });

  test('produces different ciphertexts for same plaintext (unique IV)', () => {
    const value = [1, 2, 3];
    const a = crypto.encryptJson(value);
    const b = crypto.encryptJson(value);
    expect(a.equals(b)).toBe(false);
  });

  test('ciphertext does not contain plaintext bytes', () => {
    const value = [1, 7, 3];
    const blob = crypto.encryptJson(value);
    expect(blob.toString('utf8')).not.toContain('[1,7,3]');
  });

  test('rejects tampered ciphertext', () => {
    const blob = crypto.encryptJson([1, 2, 3]);
    blob[blob.length - 1] ^= 0x01;
    expect(() => crypto.decryptJson(blob)).toThrow();
  });

  test('rejects wrong key', () => {
    const blob = crypto.encryptJson([1, 2, 3]);
    const other = createResponseCrypto(randomBytes(32));
    expect(() => other.decryptJson(blob)).toThrow();
  });

  test('rejects non-32-byte key', () => {
    expect(() => createResponseCrypto(randomBytes(16))).toThrow();
  });
});
