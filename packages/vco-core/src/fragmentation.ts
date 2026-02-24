import { HEADER_HASH_LENGTH, MAX_VCO_SIZE } from "./constants.js";
import { EnvelopeValidationError } from "./errors.js";
import { assertValidPayloadMultihash } from "./multiformat.js";
import type { VcoEnvelope } from "./types.js";
import { validateEnvelope } from "./validation.js";

export interface PayloadFragment {
  parentHeaderHash: Uint8Array;
  fragmentIndex: number;
  fragmentCount: number;
  totalPayloadSize: number;
  payloadChunk: Uint8Array;
  payloadHash: Uint8Array;
}

export interface PayloadFragmentSet {
  fragments: PayloadFragment[];
}

export interface PayloadFragmentContext {
  parentHeaderHash: Uint8Array;
  payloadHash: Uint8Array;
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

function ensurePositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new EnvelopeValidationError(`${fieldName} must be a positive integer.`);
  }
}

function assertFragmentShape(fragment: PayloadFragment): void {
  if (fragment.parentHeaderHash.length !== HEADER_HASH_LENGTH) {
    throw new EnvelopeValidationError("parentHeaderHash must be 32 bytes.");
  }

  assertValidPayloadMultihash(fragment.payloadHash);

  if (!Number.isInteger(fragment.fragmentIndex) || fragment.fragmentIndex < 0) {
    throw new EnvelopeValidationError("fragmentIndex must be a non-negative integer.");
  }

  ensurePositiveInteger(fragment.fragmentCount, "fragmentCount");

  if (!Number.isInteger(fragment.totalPayloadSize) || fragment.totalPayloadSize < 0) {
    throw new EnvelopeValidationError("totalPayloadSize must be a non-negative integer.");
  }
}

export function assertPayloadFragmentIntegrity(fragment: PayloadFragment): void {
  assertFragmentShape(fragment);

  if (fragment.fragmentIndex >= fragment.fragmentCount) {
    throw new EnvelopeValidationError("fragmentIndex must be lower than fragmentCount.");
  }
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const chunk of chunks) {
    total += chunk.length;
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }

  return out;
}

export function fragmentEnvelopePayload(
  envelope: VcoEnvelope,
  maxChunkSize = MAX_VCO_SIZE,
): PayloadFragmentSet {
  validateEnvelope(envelope);
  return fragmentPayload(
    envelope.payload,
    {
      parentHeaderHash: envelope.headerHash,
      payloadHash: envelope.header.payloadHash,
    },
    maxChunkSize,
  );
}

export function fragmentPayload(
  payload: Uint8Array,
  context: PayloadFragmentContext,
  maxChunkSize = MAX_VCO_SIZE,
): PayloadFragmentSet {
  ensurePositiveInteger(maxChunkSize, "maxChunkSize");

  if (context.parentHeaderHash.length !== HEADER_HASH_LENGTH) {
    throw new EnvelopeValidationError("parentHeaderHash must be 32 bytes.");
  }

  assertValidPayloadMultihash(context.payloadHash);

  const fragmentCount = Math.max(1, Math.ceil(payload.length / maxChunkSize));

  const fragments: PayloadFragment[] = [];

  for (let index = 0; index < fragmentCount; index += 1) {
    const start = index * maxChunkSize;
    const end = Math.min(start + maxChunkSize, payload.length);

    fragments.push({
      parentHeaderHash: Uint8Array.from(context.parentHeaderHash),
      fragmentIndex: index,
      fragmentCount,
      totalPayloadSize: payload.length,
      payloadChunk: payload.slice(start, end),
      payloadHash: Uint8Array.from(context.payloadHash),
    });
  }

  return { fragments };
}

export function assertPayloadFragmentSetIntegrity(fragmentSet: PayloadFragmentSet): void {
  if (fragmentSet.fragments.length === 0) {
    throw new EnvelopeValidationError("PayloadFragmentSet must contain at least one fragment.");
  }

  const sorted = [...fragmentSet.fragments].sort((left, right) => left.fragmentIndex - right.fragmentIndex);
  const first = sorted[0];

  assertFragmentShape(first);

  const seen = new Set<number>();

  for (const fragment of sorted) {
    assertFragmentShape(fragment);

    if (fragment.fragmentCount !== first.fragmentCount) {
      throw new EnvelopeValidationError("fragmentCount mismatch across fragments.");
    }

    if (fragment.totalPayloadSize !== first.totalPayloadSize) {
      throw new EnvelopeValidationError("totalPayloadSize mismatch across fragments.");
    }

    if (!bytesEqual(fragment.parentHeaderHash, first.parentHeaderHash)) {
      throw new EnvelopeValidationError("parentHeaderHash mismatch across fragments.");
    }

    if (!bytesEqual(fragment.payloadHash, first.payloadHash)) {
      throw new EnvelopeValidationError("payloadHash mismatch across fragments.");
    }

    assertPayloadFragmentIntegrity(fragment);

    if (seen.has(fragment.fragmentIndex)) {
      throw new EnvelopeValidationError("duplicate fragmentIndex detected.");
    }

    seen.add(fragment.fragmentIndex);
  }

  if (seen.size !== first.fragmentCount) {
    throw new EnvelopeValidationError("missing fragment index in PayloadFragmentSet.");
  }

  const expectedIndices = Array.from({ length: first.fragmentCount }, (_, index) => index);
  for (const index of expectedIndices) {
    if (!seen.has(index)) {
      throw new EnvelopeValidationError(`missing fragment index ${index}.`);
    }
  }

  const assembledSize = sorted.reduce((sum, fragment) => sum + fragment.payloadChunk.length, 0);
  if (assembledSize !== first.totalPayloadSize) {
    throw new EnvelopeValidationError(
      `Fragment chunks size ${assembledSize} does not match totalPayloadSize ${first.totalPayloadSize}.`,
    );
  }
}

export function reassemblePayloadFragments(fragmentSet: PayloadFragmentSet): Uint8Array {
  assertPayloadFragmentSetIntegrity(fragmentSet);

  const sorted = [...fragmentSet.fragments].sort((left, right) => left.fragmentIndex - right.fragmentIndex);
  const chunks = sorted.map((fragment) => fragment.payloadChunk);
  return concatChunks(chunks);
}
