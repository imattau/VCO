import {
  FLAG_POW_ACTIVE,
  FLAG_ZKP_AUTH,
  MULTIHASH_BLAKE3_256,
  PRIORITY_HINT_MASK,
  PriorityLevel,
  PROTOCOL_VERSION,
} from "./constants.js";
import { EnvelopeValidationError } from "./errors.js";
import { vco } from "./generated/vco.pb.js";
import {
  decodeMultihash,
  decodeMultikey,
  encodeBlake3Multihash,
} from "./multiformat.js";
import { solvePoWNonce } from "./pow.js";
import type { VcoEnvelope, VcoZkpExtension } from "./types.js";
import { validateEnvelope } from "./validation.js";

const MAX_UINT32 = 0xffff_ffff;

interface EnvelopeSigningMaterial {
  version: number;
  flags: number;
  payloadType: number;
  creatorId: Uint8Array;
  payloadHash: Uint8Array;
  contextId?: Uint8Array;
  nullifier?: Uint8Array;
}

interface EnvelopeHeaderHashMaterial extends EnvelopeSigningMaterial {
  signature: Uint8Array;
  nonce: number;
}

interface CreateEnvelopeInputBase {
  payload: Uint8Array;
  payloadType: number;
  flags?: number;
  version?: number;
  nonce?: number;
  powDifficulty?: number;
  contextId?: Uint8Array;
  nullifier?: Uint8Array;
  priorityHint?: PriorityLevel;
}

/**
 * Input for creating a signed VCO envelope.
 * Requires the creator's ID and private key.
 */
export interface CreateSignedEnvelopeInput extends CreateEnvelopeInputBase {
  /** Multikey-encoded public key or identifier of the creator. */
  creatorId: Uint8Array;
  /** Ed25519 private key for signing the envelope. */
  privateKey: Uint8Array;
}

/**
 * Input for creating a ZKP-authenticated VCO envelope.
 * Requires a ZKP extension and optional creator/private key for dual auth.
 */
export interface CreateZkpEnvelopeInput extends CreateEnvelopeInputBase {
  /** The ZKP extension with proof and public inputs. */
  zkpExtension: VcoZkpExtension;
  /** Optional multikey creator identifier. */
  creatorId?: Uint8Array;
  /** Optional Ed25519 private key. */
  privateKey?: Uint8Array;
}

/**
 * Union of possible inputs for creating a VCO envelope.
 */
export type CreateEnvelopeInput = CreateSignedEnvelopeInput | CreateZkpEnvelopeInput;

/**
 * Pluggable crypto provider for performing cryptographic operations.
 * Allows core to remain library-agnostic while ensuring consistent behavior.
 */
export interface EnvelopeCryptoProvider {
  /** Compute a hash (e.g., Blake3) of the given bytes. */
  digest(payload: Uint8Array): Uint8Array;
  /** Sign the given message using the provided private key. */
  sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array;
  /** Verify the signature of a message against a public key. */
  verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean;
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function encodeSigningMaterial(material: EnvelopeSigningMaterial): Uint8Array {
  return vco.v3.EnvelopeSigningMaterial.encode(vco.v3.EnvelopeSigningMaterial.create(material))
    .finish();
}

function encodeHeaderHashMaterial(material: EnvelopeHeaderHashMaterial): Uint8Array {
  return vco.v3.EnvelopeHeaderHashMaterial
    .encode(vco.v3.EnvelopeHeaderHashMaterial.create(material))
    .finish();
}

function toEnvelopeSigningMaterial(envelope: VcoEnvelope): EnvelopeSigningMaterial {
  return {
    version: envelope.header.version,
    flags: envelope.header.flags,
    payloadType: envelope.header.payloadType,
    creatorId: envelope.header.creatorId,
    payloadHash: envelope.header.payloadHash,
    contextId: envelope.header.contextId,
    nullifier: envelope.header.nullifier,
  };
}

function computeHeaderHash(
  material: EnvelopeSigningMaterial,
  signature: Uint8Array,
  nonce: number,
  crypto: EnvelopeCryptoProvider,
): Uint8Array {
  return crypto.digest(
    encodeHeaderHashMaterial({
      ...material,
      signature,
      nonce,
    }),
  );
}

function assertUint32(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0 || value > MAX_UINT32) {
    throw new EnvelopeValidationError(`${fieldName} must be a uint32.`);
  }
}

function cloneZkpExtension(extension: VcoZkpExtension): VcoZkpExtension {
  return {
    circuitId: extension.circuitId,
    proofLength: extension.proofLength,
    proof: Uint8Array.from(extension.proof),
    inputsLength: extension.inputsLength,
    publicInputs: Uint8Array.from(extension.publicInputs),
  };
}

/**
 * Extracts the priority level from a given flags bitmask.
 * @param flags The envelope header flags.
 * @returns The priority level.
 */
export function getPriority(flags: number): PriorityLevel {
  return (flags & PRIORITY_HINT_MASK) as PriorityLevel;
}

/**
 * Creates a new Verifiable Content Object (VCO) envelope from the given input.
 * Handles signing, payload hashing, and Proof of Work (PoW) computation.
 *
 * @param input The data and configuration for the envelope (e.g., payload, creator keys).
 * @param crypto The cryptographic provider for hashes and signatures.
 * @returns A fully constructed and verified VcoEnvelope object.
 * @throws {EnvelopeValidationError} If input parameters are invalid or cryptographic operations fail.
 */
export function createEnvelope(
  input: CreateEnvelopeInput,
  crypto: EnvelopeCryptoProvider,
): VcoEnvelope {
  const requestedDifficulty = input.powDifficulty ?? 0;
  const powRequested = requestedDifficulty > 0;
  let flags = (input.flags ?? 0) | (powRequested ? FLAG_POW_ACTIVE : 0);

  // Pack priority hint into lower 2 bits
  if (input.priorityHint !== undefined) {
    flags = (flags & ~PRIORITY_HINT_MASK) | (input.priorityHint & PRIORITY_HINT_MASK);
  }

  const isZkpAuth = (flags & FLAG_ZKP_AUTH) !== 0;
  const payload = Uint8Array.from(input.payload);
  let creatorId = new Uint8Array();
  let signature = new Uint8Array();
  let signingKey: Uint8Array | undefined;
  let nonce = input.nonce ?? 0;

  assertUint32(nonce, "nonce");

  if (isZkpAuth) {
    creatorId = new Uint8Array();
    signature = new Uint8Array();
  } else {
    const maybeCreatorId = "creatorId" in input ? input.creatorId : undefined;
    const maybePrivateKey = "privateKey" in input ? input.privateKey : undefined;
    if (!maybeCreatorId || !maybePrivateKey) {
      throw new EnvelopeValidationError(
        "creatorId and privateKey are required unless FLAG_ZKP_AUTH is set.",
      );
    }

    creatorId = Uint8Array.from(maybeCreatorId);
    signingKey = Uint8Array.from(maybePrivateKey);
  }

  const payloadDigest = crypto.digest(payload);
  const payloadHash = encodeBlake3Multihash(payloadDigest);

  const material: EnvelopeSigningMaterial = {
    version: input.version ?? PROTOCOL_VERSION,
    flags,
    payloadType: input.payloadType,
    creatorId,
    payloadHash,
    contextId: input.contextId ? Uint8Array.from(input.contextId) : undefined,
    nullifier: input.nullifier ? Uint8Array.from(input.nullifier) : undefined,
  };

  if (!isZkpAuth) {
    if (!signingKey) {
      throw new EnvelopeValidationError("Missing privateKey for signature-auth envelope.");
    }
    const signingMaterial = encodeSigningMaterial(material);
    signature = Uint8Array.from(crypto.sign(signingMaterial, signingKey));
  }

  let headerHash = computeHeaderHash(material, signature, nonce, crypto);
  if (powRequested) {
    const solved = solvePoWNonce({
      initialNonce: nonce,
      difficulty: requestedDifficulty,
      hashForNonce: (candidateNonce) =>
        computeHeaderHash(material, signature, candidateNonce, crypto),
    });
    nonce = solved.nonce;
    headerHash = solved.headerHash;
  }

  let zkpExtension: VcoZkpExtension | undefined;
  if (isZkpAuth) {
    if (!("zkpExtension" in input) || !input.zkpExtension) {
      throw new EnvelopeValidationError("zkpExtension is required when FLAG_ZKP_AUTH is set.");
    }
    zkpExtension = cloneZkpExtension(input.zkpExtension);
  }

  const envelope: VcoEnvelope = {
    headerHash,
    header: {
      version: material.version,
      flags: material.flags,
      payloadType: material.payloadType,
      creatorId,
      payloadHash,
      signature,
      nonce,
      contextId: material.contextId,
      nullifier: material.nullifier,
      priorityHint: material.flags & PRIORITY_HINT_MASK,
    },
    payload,
    zkpExtension,
    nullifier: material.nullifier,
  };

  validateEnvelope(envelope);
  return envelope;
}

/**
 * Asserts the full cryptographic integrity and validity of an envelope.
 * Verifies payload hashes, signatures, and header hashes.
 *
 * @param envelope The envelope to verify.
 * @param crypto The cryptographic provider for hashes and signatures.
 * @throws {EnvelopeValidationError} If any cryptographic verification fails.
 */
export function assertEnvelopeIntegrity(
  envelope: VcoEnvelope,
  crypto: EnvelopeCryptoProvider,
): void {
  validateEnvelope(envelope);

  const decodedPayloadHash = decodeMultihash(envelope.header.payloadHash);
  if (decodedPayloadHash.code !== MULTIHASH_BLAKE3_256) {
    throw new EnvelopeValidationError(
      `Unsupported payload multihash code ${decodedPayloadHash.code}.`,
    );
  }

  const expectedPayloadDigest = crypto.digest(envelope.payload);
  if (!bytesEqual(expectedPayloadDigest, decodedPayloadHash.digestBytes)) {
    throw new EnvelopeValidationError("Envelope payload hash mismatch.");
  }

  const isZkpAuth = (envelope.header.flags & FLAG_ZKP_AUTH) !== 0;
  if (!isZkpAuth) {
    const signingMaterial = encodeSigningMaterial(toEnvelopeSigningMaterial(envelope));
    const creatorKey = decodeMultikey(envelope.header.creatorId);
    if (!crypto.verify(signingMaterial, envelope.header.signature, creatorKey.keyBytes)) {
      throw new EnvelopeValidationError("Envelope signature verification failed.");
    }
  }

  const expectedHeaderHash = computeHeaderHash(
    toEnvelopeSigningMaterial(envelope),
    envelope.header.signature,
    envelope.header.nonce,
    crypto,
  );
  if (!bytesEqual(expectedHeaderHash, envelope.headerHash)) {
    throw new EnvelopeValidationError("Envelope header hash mismatch.");
  }
}

/**
 * Verifies the integrity of an envelope and returns a boolean.
 *
 * @param envelope The envelope to verify.
 * @param crypto The cryptographic provider for hashes and signatures.
 * @returns True if the envelope is valid and integrity is verified.
 */
export function verifyEnvelope(envelope: VcoEnvelope, crypto: EnvelopeCryptoProvider): boolean {
  try {
    assertEnvelopeIntegrity(envelope, crypto);
    return true;
  } catch {
    return false;
  }
}
