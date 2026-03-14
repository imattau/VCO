import { describe, it, expect, vi, beforeEach } from 'vitest';
import { E2EEService } from '../lib/E2EEService';

// Mock crypto for Node environment
if (typeof window === 'undefined') {
  (global as any).window = {
    crypto: require('crypto').webcrypto
  };
}

describe('E2EEService Unit Tests', () => {
  it('should successfully encrypt and decrypt a message', async () => {
    const { generateX25519KeyPair } = await import('@vco/vco-crypto');
    
    // Generate two pairs
    const aliceKeys = generateX25519KeyPair();
    const bobKeys = generateX25519KeyPair();

    const originalContent = "Decentralized Secret Message";
    const mediaCids: Uint8Array[] = [new Uint8Array([1, 2, 3])];

    // Alice sends to Bob
    const encrypted = await E2EEService.encryptMessage(
      bobKeys.publicKey,
      originalContent,
      mediaCids
    );

    expect(encrypted.encryptedPayload).toBeDefined();
    expect(encrypted.nonce).toHaveLength(12);

    // Bob decrypts Alice's message
    const decrypted = await E2EEService.decryptMessage(
      bobKeys.privateKey,
      encrypted.ephemeralPubkey,
      encrypted.nonce,
      encrypted.encryptedPayload
    );

    expect(decrypted.content).toBe(originalContent);
    expect(decrypted.mediaCids[0]).toEqual(mediaCids[0]);
  });

  it('should fail to decrypt with wrong private key', async () => {
    const { generateX25519KeyPair } = await import('@vco/vco-crypto');
    const bobKeys = generateX25519KeyPair();
    const eveKeys = generateX25519KeyPair();

    const encrypted = await E2EEService.encryptMessage(bobKeys.publicKey, "Secret", []);

    // Eve tries to decrypt Bob's message
    await expect(E2EEService.decryptMessage(
      eveKeys.privateKey,
      encrypted.ephemeralPubkey,
      encrypted.nonce,
      encrypted.encryptedPayload
    )).rejects.toThrow();
  });
});
