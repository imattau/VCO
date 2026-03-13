import { 
  deriveEd25519Multikey, 
  deriveEd25519PublicKey, 
  generateX25519KeyPair,
  ByteArray
} from "@vco/vco-crypto";
import { toHex } from "@vco/vco-testing";

export interface IdentityKeys {
  signingPrivateKey: ByteArray;
  signingPublicKey: ByteArray;
  creatorId: ByteArray;
  creatorIdHex: string;
  encryptionPrivateKey: ByteArray;
  encryptionPublicKey: ByteArray;
}

const STORAGE_KEY = "vco_social_identity_encrypted_keys";
const PBKDF2_ITERATIONS = 100000;

export class KeyringService {
  /**
   * Generates a complete new set of keys (Signing + Encryption),
   * encrypts them with a password, and persists them.
   */
  static async generateAndStoreIdentity(password: string): Promise<IdentityKeys> {
    // 1. Ed25519 Signing Keys
    const signingPrivateKey = new Uint8Array(32);
    window.crypto.getRandomValues(signingPrivateKey);
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
   */
  static async unlockIdentity(password: string): Promise<IdentityKeys | null> {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      const pkg = JSON.parse(saved);
      const salt = this.fromHex(pkg.salt);
      const iv = this.fromHex(pkg.iv);
      const ciphertext = this.fromHex(pkg.ciphertext);

      const encryptionKey = await this.deriveKey(password, salt);
      const decrypted = await window.crypto.subtle.decrypt(
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
      console.error("Failed to decrypt identity keys", e);
      return null;
    }
  }

  /**
   * Wipes the local identity.
   */
  static revokeIdentity(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Checks if an identity exists (even if locked).
   */
  static hasIdentity(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
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

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptionKey = await this.deriveKey(password, salt);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      encryptionKey,
      new TextEncoder().encode(serialized)
    );

    const pkg = {
      salt: toHex(salt),
      iv: toHex(iv),
      ciphertext: toHex(new Uint8Array(ciphertext))
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(pkg));
  }

  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
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
