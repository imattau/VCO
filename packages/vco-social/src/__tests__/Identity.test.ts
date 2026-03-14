import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeyringService } from '../lib/KeyringService';

// Polyfill for Node environment
if (typeof window === 'undefined') {
  (global as any).window = {
    crypto: require('crypto').webcrypto,
    __TAURI_INTERNALS__: {} // Simulate Tauri
  };
  
  // Simple localStorage mock
  const storage: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, val: string) => { storage[key] = val; },
    removeItem: (key: string) => { delete storage[key]; }
  };
}

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(async (cmd) => {
    if (cmd === 'get_vco_profile') return 'test-profile';
    return null;
  })
}));

describe('KeyringService Unit Tests', () => {
  const STORAGE_KEY = "vco_social_identity_encrypted_keys_test-profile";

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('should generate, store, and unlock an identity', async () => {
    const password = "secure-password-123";
    
    // 1. Generate
    const identity = await KeyringService.generateAndStoreIdentity(password);
    expect(identity.creatorIdHex).toBeDefined();
    expect(identity.signingPrivateKey).toHaveLength(32);

    // 2. Check existence
    const exists = await KeyringService.hasIdentity();
    expect(exists).toBe(true);

    // 3. Unlock with correct password
    const unlocked = await KeyringService.unlockIdentity(password);
    expect(unlocked).not.toBeNull();
    expect(unlocked?.creatorIdHex).toBe(identity.creatorIdHex);
  });

  it('should fail to unlock with wrong password', async () => {
    await KeyringService.generateAndStoreIdentity("correct");
    const result = await KeyringService.unlockIdentity("wrong");
    expect(result).toBeNull();
  });

  it('should correctly rotate identity (generate new keys and delete old)', async () => {
    const id1 = await KeyringService.generateAndStoreIdentity("pass1");
    const did1 = id1.creatorIdHex;

    const id2 = await KeyringService.rotateIdentity("pass2");
    const did2 = id2.creatorIdHex;

    expect(did2).not.toBe(did1);
    expect(await KeyringService.unlockIdentity("pass1")).toBeNull();
    expect((await KeyringService.unlockIdentity("pass2"))?.creatorIdHex).toBe(did2);
  });

  it('should support Export and Import of encrypted identity packages', async () => {
    const password = "migration-pass";
    
    // 1. Create identity on "Device A"
    const originalId = await KeyringService.generateAndStoreIdentity(password);
    const exportedPackage = await KeyringService.exportEncryptedPackage();
    
    expect(exportedPackage).not.toBeNull();
    expect(typeof exportedPackage).toBe('string');

    // 2. Simulate "Device B" (Clear local storage)
    localStorage.removeItem(STORAGE_KEY);
    expect(await KeyringService.hasIdentity()).toBe(false);

    // 3. Import onto "Device B"
    await KeyringService.importEncryptedPackage(exportedPackage!);
    expect(await KeyringService.hasIdentity()).toBe(true);

    // 4. Unlock on "Device B"
    const importedId = await KeyringService.unlockIdentity(password);
    expect(importedId).not.toBeNull();
    expect(importedId?.creatorIdHex).toBe(originalId.creatorIdHex);
    expect(importedId?.signingPrivateKey).toEqual(originalId.signingPrivateKey);
  });
});
