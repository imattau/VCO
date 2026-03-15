import { checkStatus, authenticate } from '@tauri-apps/plugin-biometric';

const BIO_PASSWORD_KEY = 'vco_bio_password';
const BIO_ENABLED_KEY = 'vco_bio_enabled';

/**
 * Biometric authentication service.
 * Uses tauri-plugin-biometric to gate access to a stored password copy.
 * Falls back gracefully when biometrics are unavailable.
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
   * Prompts biometric auth, then stores the password for future unlocks.
   * Call this after a successful password unlock to enroll biometrics.
   */
  static async enable(password: string): Promise<boolean> {
    try {
      await authenticate('Confirm identity to enable biometric unlock');
      localStorage.setItem(BIO_PASSWORD_KEY, password);
      localStorage.setItem(BIO_ENABLED_KEY, 'true');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Prompts biometric auth and returns the stored password on success.
   * Returns null if auth fails or biometrics not enrolled.
   */
  static async unlock(): Promise<string | null> {
    if (!this.isEnabled()) return null;
    const stored = localStorage.getItem(BIO_PASSWORD_KEY);
    if (!stored) return null;
    try {
      await authenticate('Unlock your VCO identity');
      return stored;
    } catch {
      return null;
    }
  }

  /**
   * Disables biometric unlock and removes the stored password.
   */
  static disable(): void {
    localStorage.removeItem(BIO_PASSWORD_KEY);
    localStorage.removeItem(BIO_ENABLED_KEY);
  }
}
