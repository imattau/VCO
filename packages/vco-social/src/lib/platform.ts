import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

/**
 * Platform abstraction to handle environment-specific logic
 * and provide a unified interface for both browser and Tauri environments.
 */
export interface Platform {
  isTauri(): boolean;
  getVcoProfile(): Promise<string>;
  getLocalStorage(): Storage;
  getIndexedDB(): IDBFactory;
  getRandomValues(array: Uint8Array): Uint8Array;
  getSubtleCrypto(): SubtleCrypto;
  checkBiometricStatus(): Promise<{ isAvailable: boolean }>;
  authenticateBiometric(reason: string): Promise<void>;
  atob(s: string): string;
  btoa(s: string): string;
  getEnvVar(name: string): string | undefined;
  listen<T>(eventName: string, handler: (event: { payload: T }) => void): Promise<UnlistenFn>;
  createBroadcastChannel(name: string): BroadcastChannel;
  randomUUID(): string;
}

class StandardPlatform implements Platform {
  isTauri(): boolean {
    return typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
  }

  async getVcoProfile(): Promise<string> {
    if (!this.isTauri()) return "default";
    
    // Attempt to get profile with retries
    for (let i = 0; i < 5; i++) {
      try {
        const p = await invoke<string>("get_vco_profile");
        if (p) return p;
      } catch (e) {
        console.warn(`Platform: Profile resolution attempt ${i+1} failed`, e);
        await new Promise(r => setTimeout(r, 100 * (i + 1)));
      }
    }
    return "default";
  }

  getLocalStorage(): Storage {
    return localStorage;
  }

  getIndexedDB(): IDBFactory {
    return indexedDB;
  }

  getRandomValues(array: Uint8Array): Uint8Array {
    return window.crypto.getRandomValues(array);
  }

  getSubtleCrypto(): SubtleCrypto {
    return window.crypto.subtle;
  }

  async checkBiometricStatus(): Promise<{ isAvailable: boolean }> {
    if (!this.isTauri()) return { isAvailable: false };
    const { checkStatus } = await import('@tauri-apps/plugin-biometric');
    return checkStatus();
  }

  async authenticateBiometric(reason: string): Promise<void> {
    if (!this.isTauri()) throw new Error("Biometrics not available in this environment");
    const { authenticate } = await import('@tauri-apps/plugin-biometric');
    return authenticate(reason);
  }

  atob(s: string): string {
    return atob(s);
  }

  btoa(s: string): string {
    return btoa(s);
  }

  getEnvVar(name: string): string | undefined {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[name];
    }
    return undefined;
  }

  listen<T>(eventName: string, handler: (event: { payload: T }) => void): Promise<UnlistenFn> {
    return listen<T>(eventName, handler);
  }

  createBroadcastChannel(name: string): BroadcastChannel {
    return new BroadcastChannel(name);
  }

  randomUUID(): string {
    return crypto.randomUUID();
  }
}

let currentPlatform: Platform = new StandardPlatform();

export function getPlatform(): Platform {
  return currentPlatform;
}

export function setPlatform(platform: Platform): void {
  currentPlatform = platform;
}
