import {
  ED25519_SIGNATURE_LENGTH,
  FLAG_ZKP_AUTH,
  HEADER_HASH_LENGTH,
  MAX_VCO_SIZE,
  MULTICODEC_ED25519_PUB,
  PROTOCOL_VERSION,
  RESERVED_FLAG_MASK,
} from "./constants.js";
import { EnvelopeValidationError } from "./errors.js";
import { assertValidCreatorMultikey, assertValidPayloadMultihash, decodeMultikey } from "./multiformat.js";
import { assertValidPayloadType } from "./payload-type.js";
import type { VcoEnvelope } from "./types.js";

const UINT16_MAX = 0xffff;
const UINT32_MAX = 0xffff_ffff;
const NULLIFIER_LENGTH = 32;

function assertLength(fieldName: string, value: Uint8Array, expected: number): void {
  if (value.length !== expected) {
    throw new EnvelopeValidationError(
      `${fieldName} must be ${expected} bytes, received ${value.length}.`,
    );
  }
}

function isZeroed(value: Uint8Array): boolean {
  return value.every((byte) => byte === 0);
}

function validateZkpExtension(envelope: VcoEnvelope): void {
  if (!envelope.zkpExtension) {
    throw new EnvelopeValidationError("zkpExtension is required when FLAG_ZKP_AUTH is set.");
  }

  const extension = envelope.zkpExtension;

  if (!Number.isInteger(extension.circuitId) || extension.circuitId < 0 || extension.circuitId > UINT16_MAX) {
    throw new EnvelopeValidationError("zkpExtension.circuitId must be a uint16.");
  }

  if (extension.proof.length === 0) {
    throw new EnvelopeValidationError("zkpExtension.proof must not be empty.");
  }

  if (!Number.isInteger(extension.proofLength) || extension.proofLength < 0 || extension.proofLength > UINT16_MAX) {
    throw new EnvelopeValidationError("zkpExtension.proofLength must be a uint16.");
  }

  if (extension.proofLength !== extension.proof.length) {
    throw new EnvelopeValidationError("zkpExtension.proofLength must match zkpExtension.proof.length.");
  }

  if (!Number.isInteger(extension.inputsLength) || extension.inputsLength < 0 || extension.inputsLength > UINT16_MAX) {
    throw new EnvelopeValidationError("zkpExtension.inputsLength must be a uint16.");
  }

  if (extension.inputsLength !== extension.publicInputs.length) {
    throw new EnvelopeValidationError(
      "zkpExtension.inputsLength must match zkpExtension.publicInputs.length.",
    );
  }
}

export function validateEnvelope(envelope: VcoEnvelope): void {
  if (envelope.header.version !== PROTOCOL_VERSION) {
    throw new EnvelopeValidationError(
      `Unsupported version ${envelope.header.version}; expected ${PROTOCOL_VERSION}.`,
    );
  }

  if (envelope.payload.length > MAX_VCO_SIZE) {
    throw new EnvelopeValidationError(
      `Payload exceeds MAX_VCO_SIZE (${MAX_VCO_SIZE}).`,
    );
  }

  assertLength("headerHash", envelope.headerHash, HEADER_HASH_LENGTH);
  assertValidPayloadMultihash(envelope.header.payloadHash);

  if (
    !Number.isInteger(envelope.header.flags) ||
    envelope.header.flags < 0 ||
    envelope.header.flags > 0xff
  ) {
    throw new EnvelopeValidationError("flags must be an unsigned byte.");
  }

  if ((envelope.header.flags & RESERVED_FLAG_MASK) !== 0) {
    throw new EnvelopeValidationError("flags reserve bits 2-3; they must be zero.");
  }

  if (
    !Number.isInteger(envelope.header.nonce) ||
    envelope.header.nonce < 0 ||
    envelope.header.nonce > UINT32_MAX
  ) {
    throw new EnvelopeValidationError("nonce must be a uint32.");
  }

  if (envelope.header.contextId) {
    assertLength("contextId", envelope.header.contextId, 8);
  }

  if (envelope.header.nullifier) {
    assertLength("nullifier", envelope.header.nullifier, 32);
  }

  if (envelope.header.priorityHint !== (envelope.header.flags & 0x03)) {
    throw new EnvelopeValidationError("priorityHint must match the lower bits of flags.");
  }

  const isZkpAuth = (envelope.header.flags & FLAG_ZKP_AUTH) !== 0;
  if (isZkpAuth) {
    if (!envelope.header.nullifier) {
      throw new EnvelopeValidationError("nullifier is mandatory when FLAG_ZKP_AUTH is set.");
    }

    if (envelope.header.creatorId.length > 0 && !isZeroed(envelope.header.creatorId)) {
      throw new EnvelopeValidationError(
        "creatorId must be empty or zeroed when FLAG_ZKP_AUTH is set.",
      );
    }

    if (envelope.header.signature.length > 0 && !isZeroed(envelope.header.signature)) {
      throw new EnvelopeValidationError(
        "signature must be empty or zeroed when FLAG_ZKP_AUTH is set.",
      );
    }

    validateZkpExtension(envelope);
  } else {
    if (envelope.zkpExtension) {
      throw new EnvelopeValidationError("zkpExtension must be omitted unless FLAG_ZKP_AUTH is set.");
    }

    assertValidCreatorMultikey(envelope.header.creatorId);

    if (envelope.header.signature.length === 0) {
      throw new EnvelopeValidationError("signature must not be empty.");
    }

    const creatorKey = decodeMultikey(envelope.header.creatorId);
    if (
      creatorKey.codec === MULTICODEC_ED25519_PUB &&
      envelope.header.signature.length !== ED25519_SIGNATURE_LENGTH
    ) {
      throw new EnvelopeValidationError(
        `Ed25519 signatures must be ${ED25519_SIGNATURE_LENGTH} bytes.`,
      );
    }
  }

  assertValidPayloadType(envelope.header.payloadType);
}
