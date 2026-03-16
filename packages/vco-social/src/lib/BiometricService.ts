import { checkStatus, authenticate } from '@tauri-apps/plugin-biometric';

const BIO_ENABLED_KEY = 'vco_bio_enabled';

/**
 * Biometric authentication service.
 * 
 * SECURITY NOTE: A previous implementation stored the plaintext password in localStorage.
 * This was a critical vulnerability. Biometric unlock MUST be implemented using a 
 * platform-native secure enclave (Keychain/Keystore) via a dedicated plugin 
 * (e.g., tauri-plugin-stronghold).
 */
export class BiometricService {
  /**
   * Returns true if the device supports biometric authentication.
   * Always false outside Tauri (browser dev mode).
   */
  static async isAvailable(): Promise<boolean> {
    if (!(window as any).__TAURI_INTERNALS__) return false;
    try {
      const status = await checkStatus();
      return status.isAvailable;
    } catch {
      return false;
    }
  }

  /**
   * Returns true if the user has opted into biometric unlock.
   */
  static isEnabled(): boolean {
    return localStorage.getItem(BIO_ENABLED_KEY) === 'true';
  }

  /**
   * Prompts biometric auth.
   * NOTE: Plaintext password storage has been REMOVED for security.
   * This feature currently only verifies the user but does not store the secret.
   */
  static async enable(_password: string): Promise<boolean> {
    try {
      await authenticate('Confirm identity to enable biometric unlock');
      // SECURITY: DO NOT store 'password' in localStorage!
      localStorage.setItem(BIO_ENABLED_KEY, 'true');
      console.warn("BiometricService: enabled without persistent secret storage. Secure vault plugin required for full functionality.");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Prompts biometric auth.
   * Returns null because secure secret storage is not yet implemented.
   */
  static async unlock(): Promise<string | null> {
    if (!this.isEnabled()) return null;
    try {
      await authenticate('Unlock your VCO identity');
      // In a real implementation, we would retrieve the secret from a secure vault here.
      console.error("BiometricService: biometric unlock called but secure secret storage is not implemented.");
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Disables biometric unlock.
   */
  static disable(): void {
    localStorage.removeItem(BIO_ENABLED_KEY);
  }
}
