import { 
  deriveEd25519Multikey, 
  deriveEd25519PublicKey, 
  generateX25519KeyPair,
  ByteArray
} from "@vco/vco-crypto";
import { toHex } from "@/lib/encoding";
import { getPlatform } from "./platform";

export interface IdentityKeys {
  signingPrivateKey: ByteArray;
  signingPublicKey: ByteArray;
  creatorId: ByteArray;
  creatorIdHex: string;
  encryptionPrivateKey: ByteArray;
  encryptionPublicKey: ByteArray;
}

const STORAGE_KEY_BASE = "vco_social_identity_encrypted_keys";
const PBKDF2_ITERATIONS = 600000;
const PBKDF2_LEGACY_ITERATIONS = 100000;

export class KeyringService {
  private static async getStorageKey(): Promise<string> {
    const profile = await getPlatform().getVcoProfile();
    return `${STORAGE_KEY_BASE}_${profile}`;
  }

  /**
   * Generates a complete new set of keys (Signing + Encryption),
   * encrypts them with a password, and persists them.
   */
  static async generateAndStoreIdentity(password: string): Promise<IdentityKeys> {
    // 1. Ed25519 Signing Keys
    const signingPrivateKey = new Uint8Array(32);
    getPlatform().getRandomValues(signingPrivateKey);
    const signingPublicKey = deriveEd25519PublicKey(signingPrivateKey);
    const creatorId = deriveEd25519Multikey(signingPrivateKey);

    // 2. X25519 Encryption Keys
    const encryptionKeys = generateX25519KeyPair();

    const identity: IdentityKeys = {
      signingPrivateKey,
      signingPublicKey,
      creatorId,
      creatorIdHex: toHex(creatorId),
      encryptionPrivateKey: encryptionKeys.privateKey,
      encryptionPublicKey: encryptionKeys.publicKey
    };

    await this.persistIdentity(identity, password);
    return identity;
  }

  /**
   * Attempts to decrypt and load the identity using the provided password.
   * Supports automatic migration from legacy PBKDF2 iterations.
   */
  static async unlockIdentity(password: string): Promise<IdentityKeys | null> {
    const key = await this.getStorageKey();
    const saved = getPlatform().getLocalStorage().getItem(key);
    if (!saved) return null;

    const pkg = JSON.parse(saved);
    const salt = this.fromHex(pkg.salt);
    const iv = this.fromHex(pkg.iv);
    const ciphertext = this.fromHex(pkg.ciphertext);

    // Try current (secure) iterations first
    let result = await this.tryDecrypt(password, salt, iv, ciphertext, PBKDF2_ITERATIONS);
    
    // If it fails, try legacy iterations
    if (!result) {
      result = await this.tryDecrypt(password, salt, iv, ciphertext, PBKDF2_LEGACY_ITERATIONS);
      
      // If legacy works, upgrade automatically
      if (result) {
        console.info(`KeyringService: upgrading identity to ${PBKDF2_ITERATIONS} iterations.`);
        await this.persistIdentity(result, password);
      }
    }

    return result;
  }

  private static async tryDecrypt(
    password: string, 
    salt: Uint8Array, 
    iv: Uint8Array, 
    ciphertext: Uint8Array, 
    iterations: number
  ): Promise<IdentityKeys | null> {
    try {
      const encryptionKey = await this.deriveKey(password, salt, iterations);
      const decrypted = await getPlatform().getSubtleCrypto().decrypt(
        { name: "AES-GCM", iv },
        encryptionKey,
        ciphertext
      );

      const parsed = JSON.parse(new TextDecoder().decode(decrypted));
      return {
        signingPrivateKey: this.fromHex(parsed.signingPrivateKey),
        signingPublicKey: this.fromHex(parsed.signingPublicKey),
        creatorId: this.fromHex(parsed.creatorId),
        creatorIdHex: parsed.creatorIdHex,
        encryptionPrivateKey: this.fromHex(parsed.encryptionPrivateKey),
        encryptionPublicKey: this.fromHex(parsed.encryptionPublicKey),
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Wipes the local identity.
   */
  static async revokeIdentity(): Promise<void> {
    const key = await this.getStorageKey();
    getPlatform().getLocalStorage().removeItem(key);
  }

  /**
   * Securely rotates the identity by revoking the current one and generating a new one.
   */
  static async rotateIdentity(newPassword: string): Promise<IdentityKeys> {
    await this.revokeIdentity();
    return await this.generateAndStoreIdentity(newPassword);
  }

  /**
   * Checks if an identity exists (even if locked).
   */
  static async hasIdentity(): Promise<boolean> {
    const key = await this.getStorageKey();
    return getPlatform().getLocalStorage().getItem(key) !== null;
  }

  /**
   * Exports the encrypted identity package as a string.
   */
  static async exportEncryptedPackage(): Promise<string | null> {
    const key = await this.getStorageKey();
    return getPlatform().getLocalStorage().getItem(key);
  }

  /**
   * Imports an encrypted identity package.
   */
  static async importEncryptedPackage(pkgJson: string): Promise<void> {
    const key = await this.getStorageKey();
    getPlatform().getLocalStorage().setItem(key, pkgJson);
  }

  private static async persistIdentity(identity: IdentityKeys, password: string) {
    const serialized = JSON.stringify({
      signingPrivateKey: toHex(identity.signingPrivateKey),
      signingPublicKey: toHex(identity.signingPublicKey),
      creatorId: toHex(identity.creatorId),
      creatorIdHex: identity.creatorIdHex,
      encryptionPrivateKey: toHex(identity.encryptionPrivateKey),
      encryptionPublicKey: toHex(identity.encryptionPublicKey),
    });

    const salt = getPlatform().getRandomValues(new Uint8Array(16));
    const iv = getPlatform().getRandomValues(new Uint8Array(12));
    const encryptionKey = await this.deriveKey(password, salt, PBKDF2_ITERATIONS);

    const ciphertext = await getPlatform().getSubtleCrypto().encrypt(
      { name: "AES-GCM", iv },
      encryptionKey,
      new TextEncoder().encode(serialized)
    );

    const pkg = {
      salt: toHex(salt),
      iv: toHex(iv),
      ciphertext: toHex(new Uint8Array(ciphertext))
    };

    const key = await this.getStorageKey();
    getPlatform().getLocalStorage().setItem(key, JSON.stringify(pkg));
  }

  private static async deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
    const passwordKey = await getPlatform().getSubtleCrypto().importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    return await getPlatform().getSubtleCrypto().deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  private static fromHex(hex: string): Uint8Array {
    const matches = hex.match(/.{1,2}/g);
    if (!matches) return new Uint8Array(0);
    return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
  }
}
