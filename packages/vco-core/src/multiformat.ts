import {
  CONTEXT_ID_LENGTH,
  ED25519_PUBLIC_KEY_LENGTH,
  MULTICODEC_ED25519_PUB,
  MULTICODEC_SECP256K1_PUB,
  MULTIHASH_BLAKE3_256,
} from "./constants.js";
import { MultiformatError } from "./errors.js";
import { digest, varint } from "multiformats";

export interface VarintDecoded {
  value: number;
  bytesRead: number;
}

export interface DecodedMultikey {
  codec: number;
  keyBytes: Uint8Array;
}

export interface DecodedMultihash {
  code: number;
  digestSize: number;
  digestBytes: Uint8Array;
}

/**
 * Converts a Uint8Array to a hex-encoded string.
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts a hex-encoded string to a Uint8Array.
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\da-f]{2}/gi) ?? [];
  return new Uint8Array(pairs.map((p) => parseInt(p, 16)));
}

/**
 * Derives a fixed-length blind context identifier from a topic string.
 *
 * @param topic The human-readable topic or group identifier.
 * @param digest A function that returns a cryptographic hash (e.g. Blake3).
 * @returns An 8-byte Uint8Array for blind routing.
 */
export function deriveContextId(
  topic: string,
  digest: (data: Uint8Array) => Uint8Array,
): Uint8Array {
  const topicBytes = new TextEncoder().encode(topic);
  const hash = digest(topicBytes);
  return hash.slice(0, CONTEXT_ID_LENGTH);
}

export function encodeVarint(value: number): Uint8Array {
  if (!Number.isInteger(value) || value < 0) {
    throw new MultiformatError("Varint value must be a non-negative integer.");
  }

  const out = new Uint8Array(varint.encodingLength(value));
  return varint.encodeTo(value, out, 0);
}

export function decodeVarint(bytes: Uint8Array, offset = 0): VarintDecoded {
  try {
    const [value, bytesRead] = varint.decode(bytes, offset);
    return { value, bytesRead };
  } catch {
    throw new MultiformatError("Failed to decode varint.");
  }
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }

  return out;
}

export function encodeEd25519Multikey(publicKey: Uint8Array): Uint8Array {
  if (publicKey.length !== ED25519_PUBLIC_KEY_LENGTH) {
    throw new MultiformatError(
      `Ed25519 public key must be ${ED25519_PUBLIC_KEY_LENGTH} bytes.`,
    );
  }

  return concatBytes(encodeVarint(MULTICODEC_ED25519_PUB), publicKey);
}

export function decodeMultikey(multikey: Uint8Array): DecodedMultikey {
  if (multikey.length === 0) {
    throw new MultiformatError("creatorId must not be empty.");
  }

  const { value: codec, bytesRead } = decodeVarint(multikey);
  const keyBytes = multikey.slice(bytesRead);

  if (keyBytes.length === 0) {
    throw new MultiformatError("multikey must include key bytes.");
  }

  return { codec, keyBytes };
}

export function assertValidCreatorMultikey(multikey: Uint8Array): void {
  const decoded = decodeMultikey(multikey);

  if (decoded.codec === MULTICODEC_ED25519_PUB && decoded.keyBytes.length !== ED25519_PUBLIC_KEY_LENGTH) {
    throw new MultiformatError(
      `Ed25519 multikey payload must be ${ED25519_PUBLIC_KEY_LENGTH} bytes.`,
    );
  }

  if (
    decoded.codec === MULTICODEC_SECP256K1_PUB &&
    decoded.keyBytes.length !== 33 &&
    decoded.keyBytes.length !== 65
  ) {
    throw new MultiformatError("Secp256k1 multikey payload must be 33 or 65 bytes.");
  }

  if (decoded.codec !== MULTICODEC_ED25519_PUB && decoded.codec !== MULTICODEC_SECP256K1_PUB) {
    throw new MultiformatError(`Unsupported multikey codec ${decoded.codec}.`);
  }
}

export function encodeBlake3Multihash(digestBytes: Uint8Array): Uint8Array {
  return digest.create(MULTIHASH_BLAKE3_256, digestBytes).bytes;
}

export function decodeMultihash(multihash: Uint8Array): DecodedMultihash {
  try {
    const decoded = digest.decode(multihash);
    return {
      code: decoded.code,
      digestSize: decoded.size,
      digestBytes: decoded.digest,
    };
  } catch {
    throw new MultiformatError("Failed to decode multihash.");
  }
}

export function assertValidPayloadMultihash(multihash: Uint8Array): void {
  const decoded = decodeMultihash(multihash);

  if (decoded.digestBytes.length === 0) {
    throw new MultiformatError("multihash digest must not be empty.");
  }
}
