import { ed25519 } from "@noble/curves/ed25519";
import { blake3 } from "@noble/hashes/blake3";
import { varint } from "multiformats";

export type ByteArray = Uint8Array;
const MULTICODEC_ED25519_PUB = 0xed;

export interface HashProvider {
  digest(payload: ByteArray): ByteArray;
}

export interface SignatureProvider {
  sign(message: ByteArray, privateKey: ByteArray): ByteArray;
  verify(message: ByteArray, signature: ByteArray, publicKey: ByteArray): boolean;
}

export interface CryptoProvider extends HashProvider, SignatureProvider {}

export class UnconfiguredCryptoProvider implements CryptoProvider {
  digest(_payload: ByteArray): ByteArray {
    throw new Error("No crypto provider configured. Install and wire a standard library adapter.");
  }

  sign(_message: ByteArray, _privateKey: ByteArray): ByteArray {
    throw new Error("No crypto provider configured. Install and wire a standard library adapter.");
  }

  verify(_message: ByteArray, _signature: ByteArray, _publicKey: ByteArray): boolean {
    throw new Error("No crypto provider configured. Install and wire a standard library adapter.");
  }
}

export class NobleCryptoProvider implements CryptoProvider {
  digest(payload: ByteArray): ByteArray {
    return blake3(payload);
  }

  sign(message: ByteArray, privateKey: ByteArray): ByteArray {
    return ed25519.sign(message, privateKey);
  }

  verify(message: ByteArray, signature: ByteArray, publicKey: ByteArray): boolean {
    return ed25519.verify(signature, message, publicKey);
  }
}

export function deriveEd25519PublicKey(privateKey: ByteArray): ByteArray {
  return ed25519.getPublicKey(privateKey);
}

export function deriveEd25519Multikey(privateKey: ByteArray): ByteArray {
  const publicKey = deriveEd25519PublicKey(privateKey);
  const prefix = new Uint8Array(varint.encodingLength(MULTICODEC_ED25519_PUB));
  const encodedPrefix = varint.encodeTo(MULTICODEC_ED25519_PUB, prefix, 0);
  const out = new Uint8Array(encodedPrefix.length + publicKey.length);
  out.set(encodedPrefix, 0);
  out.set(publicKey, encodedPrefix.length);
  return out;
}

export function createNobleCryptoProvider(): CryptoProvider {
  return new NobleCryptoProvider();
}

export function createCryptoProvider(): CryptoProvider {
  return new UnconfiguredCryptoProvider();
}
