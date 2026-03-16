import { describe, it, expect, beforeEach } from 'vitest';
import { BiometricService } from '../lib/BiometricService';
import { setPlatform } from '../lib/platform';
import { MockPlatform } from './PlatformTestUtils';

describe('BiometricService Unit Tests (Platform Abstracted)', () => {
  let mockPlatform: MockPlatform;
  const BIO_ENABLED_KEY = 'vco_bio_enabled';

  beforeEach(() => {
    mockPlatform = new MockPlatform();
    setPlatform(mockPlatform);
  });

  it('should enable biometrics without storing the password in localStorage', async () => {
    const password = "my-secret-password";
    const success = await BiometricService.enable(password);
    
    expect(success).toBe(true);
    expect(mockPlatform.getLocalStorage().getItem(BIO_ENABLED_KEY)).toBe('true');
    expect(mockPlatform.authenticateBiometric).toHaveBeenCalled();
    
    // Check that the password string doesn't appear anywhere in localStorage
    const storage = (mockPlatform as any).storage;
    for (const key in storage) {
      expect(storage[key]).not.toBe(password);
    }
  });

  it('should return null on unlock because secure storage is not implemented', async () => {
    await BiometricService.enable("some-pass");
    const result = await BiometricService.unlock();
    expect(result).toBeNull();
    expect(mockPlatform.authenticateBiometric).toHaveBeenCalled();
  });

  it('should correctly disable biometrics', () => {
    mockPlatform.getLocalStorage().setItem(BIO_ENABLED_KEY, 'true');
    BiometricService.disable();
    expect(mockPlatform.getLocalStorage().getItem(BIO_ENABLED_KEY)).toBeNull();
  });
});
