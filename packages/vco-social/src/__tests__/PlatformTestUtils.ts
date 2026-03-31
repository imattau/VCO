import { vi } from 'vitest';
import type { Platform } from '../lib/platform';

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
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { for (const key in storage) delete storage[key]; },
    length: 0,
    key: (_index: number) => null
  };
}

export class MockPlatform implements Platform {
  profile: string = "test-profile";
  storage: Record<string, string> = {};
  
  isTauri = vi.fn(() => true);
  
  getVcoProfile = vi.fn(async () => this.profile);
  
  getLocalStorage = vi.fn(() => ({
    getItem: vi.fn((key: string) => this.storage[key] || null),
    setItem: vi.fn((key: string, val: string) => { this.storage[key] = val; }),
    removeItem: vi.fn((key: string) => { delete this.storage[key]; }),
    clear: vi.fn(() => { this.storage = {}; }),
    length: 0,
    key: vi.fn((_index: number) => null)
  } as unknown as Storage));

  getIndexedDB = vi.fn(() => (global as any).indexedDB);

  getRandomValues = vi.fn((array: Uint8Array) => {
    return (global as any).window.crypto.getRandomValues(array);
  });

  getSubtleCrypto = vi.fn(() => (global as any).window.crypto.subtle);

  checkBiometricStatus = vi.fn(async () => ({ isAvailable: true }));
  
  authenticateBiometric = vi.fn(async (_reason: string) => {
    // Default success
    return;
  });

  atob = vi.fn((s: string) => atob(s));
  btoa = vi.fn((s: string) => btoa(s));
  
  getEnvVar = vi.fn((name: string) => (global as any).process?.env?.[name]);

  listen = vi.fn(async (_eventName: string, _handler: (event: { payload: any }) => void) => {
    return () => {};
  });

  createBroadcastChannel = vi.fn((name: string) => new BroadcastChannel(name));

  randomUUID = vi.fn(() => (global as any).crypto.randomUUID?.() || "mock-uuid");
}

/**
 * Helper to setup a standard mock environment for vco-social tests.
 */
export function setupTestPlatform() {
  const mock = new MockPlatform();
  return mock;
}
