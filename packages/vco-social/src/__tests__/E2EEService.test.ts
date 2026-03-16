// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { E2EEService } from '../lib/E2EEService';
import { generateX25519KeyPair } from '@vco/vco-crypto';

// Polyfill window.crypto.getRandomValues for JSDOM
if (typeof window !== 'undefined' && !window.crypto) {
  (window as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: (require('node:crypto').webcrypto).subtle
  };
} else if (typeof window !== 'undefined' && window.crypto && !window.crypto.subtle) {
    (window.crypto as any).subtle = (require('node:crypto').webcrypto).subtle;
}

describe('E2EEService', () => {
  it('should encrypt and decrypt a message correctly', async () => {
    const recipient = generateX25519KeyPair();
    const content = 'Hello, this is a secure message!';
    const mediaCids = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];

    // Encrypt
    const encrypted = await E2EEService.encryptMessage(recipient.publicKey, content, mediaCids);
    
    expect(encrypted.ephemeralPubkey).toBeDefined();
    expect(encrypted.nonce).toHaveLength(12);
    expect(encrypted.encryptedPayload).toBeDefined();

    // Decrypt
    const decrypted = await E2EEService.decryptMessage(
      recipient.privateKey,
      encrypted.ephemeralPubkey,
      encrypted.nonce,
      encrypted.encryptedPayload
    );

    expect(decrypted.content).toBe(content);
    expect(decrypted.mediaCids).toHaveLength(2);
    expect(decrypted.mediaCids[0]).toEqual(mediaCids[0]);
    expect(decrypted.mediaCids[1]).toEqual(mediaCids[1]);
  });

  it('should fail to decrypt with the wrong private key', async () => {
    const recipient = generateX25519KeyPair();
    const attacker = generateX25519KeyPair();
    const content = 'Sensitive data';

    const encrypted = await E2EEService.encryptMessage(recipient.publicKey, content);

    await expect(E2EEService.decryptMessage(
      attacker.privateKey,
      encrypted.ephemeralPubkey,
      encrypted.nonce,
      encrypted.encryptedPayload
    )).rejects.toThrow();
  });

  it('should fail to decrypt if the payload is tampered with', async () => {
    const recipient = generateX25519KeyPair();
    const content = 'Authentic message';

    const encrypted = await E2EEService.encryptMessage(recipient.publicKey, content);
    
    // Tamper with encrypted payload
    encrypted.encryptedPayload[0] ^= 0xff;

    await expect(E2EEService.decryptMessage(
      recipient.privateKey,
      encrypted.ephemeralPubkey,
      encrypted.nonce,
      encrypted.encryptedPayload
    )).rejects.toThrow();
  });
});
