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
  beforeEach(() => {
    localStorage.removeItem("vco_social_identity_encrypted_keys_test-profile");
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
    expect(unlocked?.signingPrivateKey).toEqual(identity.signingPrivateKey);
  });

  it('should fail to unlock with wrong password', async () => {
    await KeyringService.generateAndStoreIdentity("correct");
    const result = await KeyringService.unlockIdentity("wrong");
    expect(result).toBeNull();
  });

  it('should correctly revoke identity', async () => {
    await KeyringService.generateAndStoreIdentity("pass");
    expect(await KeyringService.hasIdentity()).toBe(true);
    
    await KeyringService.revokeIdentity();
    expect(await KeyringService.hasIdentity()).toBe(false);
  });
});
