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

const STORAGE_KEY = "vco_social_identity_keys";

export class KeyringService {
  /**
   * Generates a complete new set of keys (Signing + Encryption) and persists them.
   */
  static generateAndStoreIdentity(): IdentityKeys {
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

    this.persistIdentity(identity);
    return identity;
  }

  /**
   * Loads the identity from local storage, if it exists.
   */
  static loadIdentity(): IdentityKeys | null {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);
      return {
        signingPrivateKey: this.fromHex(parsed.signingPrivateKey),
        signingPublicKey: this.fromHex(parsed.signingPublicKey),
        creatorId: this.fromHex(parsed.creatorId),
        creatorIdHex: parsed.creatorIdHex,
        encryptionPrivateKey: this.fromHex(parsed.encryptionPrivateKey),
        encryptionPublicKey: this.fromHex(parsed.encryptionPublicKey),
      };
    } catch (e) {
      console.error("Failed to parse stored identity keys", e);
      return null;
    }
  }

  /**
   * Wipes the local identity.
   */
  static revokeIdentity(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private static persistIdentity(identity: IdentityKeys) {
    const serialized = {
      signingPrivateKey: toHex(identity.signingPrivateKey),
      signingPublicKey: toHex(identity.signingPublicKey),
      creatorId: toHex(identity.creatorId),
      creatorIdHex: identity.creatorIdHex,
      encryptionPrivateKey: toHex(identity.encryptionPrivateKey),
      encryptionPublicKey: toHex(identity.encryptionPublicKey),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  }

  private static fromHex(hex: string): Uint8Array {
    const matches = hex.match(/.{1,2}/g);
    if (!matches) return new Uint8Array(0);
    return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
  }
}
