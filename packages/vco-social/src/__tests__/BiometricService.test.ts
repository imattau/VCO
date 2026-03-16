import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BiometricService } from '../lib/BiometricService';

// Polyfill for Node environment
if (typeof window === 'undefined') {
  (global as any).window = {
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

// Mock tauri-plugin-biometric
vi.mock('@tauri-apps/plugin-biometric', () => ({
  checkStatus: vi.fn(async () => ({ isAvailable: true })),
  authenticate: vi.fn(async () => true)
}));

describe('BiometricService Security Tests', () => {
  const BIO_ENABLED_KEY = 'vco_bio_enabled';
  const BIO_PASSWORD_KEY = 'vco_bio_password'; // Legacy key

  beforeEach(() => {
    localStorage.removeItem(BIO_ENABLED_KEY);
    localStorage.removeItem(BIO_PASSWORD_KEY);
    vi.clearAllMocks();
  });

  it('should enable biometrics without storing the password in localStorage', async () => {
    const password = "my-secret-password";
    const success = await BiometricService.enable(password);
    
    expect(success).toBe(true);
    expect(localStorage.getItem(BIO_ENABLED_KEY)).toBe('true');
    
    // CRITICAL SECURITY CHECK:
    expect(localStorage.getItem(BIO_PASSWORD_KEY)).toBeNull();
    
    // Also check that the password string doesn't appear anywhere else in localStorage
    const allKeys = Object.keys((global as any).localStorage);
    for (const key of allKeys) {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem') {
        expect(localStorage.getItem(key)).not.toBe(password);
      }
    }
  });

  it('should return null on unlock because secure storage is not implemented', async () => {
    await BiometricService.enable("some-pass");
    const result = await BiometricService.unlock();
    expect(result).toBeNull();
  });

  it('should correctly disable biometrics', () => {
    localStorage.setItem(BIO_ENABLED_KEY, 'true');
    BiometricService.disable();
    expect(localStorage.getItem(BIO_ENABLED_KEY)).toBeNull();
  });
});
