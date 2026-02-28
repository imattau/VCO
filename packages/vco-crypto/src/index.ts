import { ed25519 } from "@noble/curves/ed25519";
import { blake3 } from "@noble/hashes/blake3";
import { varint } from "multiformats";
import { CryptoError } from "./errors.js";

/**
 * Common type for byte arrays (Uint8Array).
 */
export type ByteArray = Uint8Array;
const MULTICODEC_ED25519_PUB = 0xed;

/**
 * Interface for hashing operations required by the VCO protocol.
 */
export interface HashProvider {
  /** Computes a hash digest of the given payload. */
  digest(payload: ByteArray): ByteArray;
}

/**
 * Interface for signing and verification operations required by the VCO protocol.
 */
export interface SignatureProvider {
  /** Signs a message using a private key. */
  sign(message: ByteArray, privateKey: ByteArray): ByteArray;
  /** Verifies a signature against a message and public key. */
  verify(message: ByteArray, signature: ByteArray, publicKey: ByteArray): boolean;
}

/**
 * Full cryptographic provider combining hashing and signature capabilities.
 */
export interface CryptoProvider extends HashProvider, SignatureProvider {}

/**
 * Default provider that throws errors if used before a real provider is configured.
 */
export class UnconfiguredCryptoProvider implements CryptoProvider {
  digest(_payload: ByteArray): ByteArray {
    throw new CryptoError("No crypto provider configured. Install and wire a standard library adapter.");
  }

  sign(_message: ByteArray, _privateKey: ByteArray): ByteArray {
    throw new CryptoError("No crypto provider configured. Install and wire a standard library adapter.");
  }

  verify(_message: ByteArray, _signature: ByteArray, _publicKey: ByteArray): boolean {
    throw new CryptoError("No crypto provider configured. Install and wire a standard library adapter.");
  }
}

/**
 * standard implementation of CryptoProvider using Noble libraries (@noble/curves, @noble/hashes).
 * This is the recommended provider for production use.
 */
export class NobleCryptoProvider implements CryptoProvider {
  /** Computes Blake3 hash. */
  digest(payload: ByteArray): ByteArray {
    return blake3(payload);
  }

  /** Signs using Ed25519. */
  sign(message: ByteArray, privateKey: ByteArray): ByteArray {
    return ed25519.sign(message, privateKey);
  }

  /** Verifies using Ed25519. */
  verify(message: ByteArray, signature: ByteArray, publicKey: ByteArray): boolean {
    return ed25519.verify(signature, message, publicKey);
  }
}

/**
 * Derives an Ed25519 public key from a private key.
 *
 * @param privateKey The Ed25519 private key.
 * @returns The derived 32-byte public key.
 */
export function deriveEd25519PublicKey(privateKey: ByteArray): ByteArray {
  return ed25519.getPublicKey(privateKey);
}

/**
 * Derives an Ed25519 multikey-encoded public key from a private key.
 * Prepends the 0xed multicodec prefix to the 32-byte public key.
 *
 * @param privateKey The Ed25519 private key.
 * @returns The multikey-encoded public key.
 */
export function deriveEd25519Multikey(privateKey: ByteArray): ByteArray {
  const publicKey = deriveEd25519PublicKey(privateKey);
  const prefix = new Uint8Array(varint.encodingLength(MULTICODEC_ED25519_PUB));
  const encodedPrefix = varint.encodeTo(MULTICODEC_ED25519_PUB, prefix, 0);
  const out = new Uint8Array(encodedPrefix.length + publicKey.length);
  out.set(encodedPrefix, 0);
  out.set(publicKey, encodedPrefix.length);
  return out;
}

/**
 * Creates a standard NobleCryptoProvider instance.
 *
 * @returns A new instance of NobleCryptoProvider.
 */
export function createNobleCryptoProvider(): CryptoProvider {
  return new NobleCryptoProvider();
}

/**
 * Creates an unconfigured CryptoProvider instance that will throw if used.
 * Useful for bootstrapping or testing scenarios.
 *
 * @returns A new instance of UnconfiguredCryptoProvider.
 */
export function createCryptoProvider(): CryptoProvider {
  return new UnconfiguredCryptoProvider();
}
