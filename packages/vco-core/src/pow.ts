import { PoWError } from "./errors.js";
import type { VcoEnvelope } from "./types.js";

const MAX_UINT32 = 0xffff_ffff;
const HASH_BITS = 256;

function assertDifficulty(difficulty: number): void {
  if (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > HASH_BITS) {
    throw new PoWError("PoW difficulty must be an integer between 0 and 256.");
  }
}

export function countLeadingZeroBits(bytes: Uint8Array): number {
  if (bytes.length === 0) {
    return 0;
  }

  let bits = 0;
  for (const byte of bytes) {
    if (byte === 0) {
      bits += 8;
      continue;
    }

    bits += Math.clz32(byte) - 24;
    break;
  }

  return bits;
}

export function verifyPoW(headerHash: Uint8Array, difficulty: number): boolean {
  assertDifficulty(difficulty);
  if (difficulty === 0) {
    return true;
  }

  return countLeadingZeroBits(headerHash) >= difficulty;
}

export interface SolvePoWInput {
  initialNonce?: number;
  difficulty: number;
  hashForNonce: (nonce: number) => Uint8Array;
}

export interface SolvePoWResult {
  nonce: number;
  headerHash: Uint8Array;
  attempts: number;
}

export function solvePoWNonce(input: SolvePoWInput): SolvePoWResult {
  assertDifficulty(input.difficulty);
  const initialNonce = input.initialNonce ?? 0;
  if (!Number.isInteger(initialNonce) || initialNonce < 0 || initialNonce > MAX_UINT32) {
    throw new PoWError("PoW nonce must be a uint32.");
  }

  let nonce = initialNonce >>> 0;
  let attempts = 0;
  while (attempts <= MAX_UINT32) {
    const headerHash = input.hashForNonce(nonce);
    attempts += 1;

    if (verifyPoW(headerHash, input.difficulty)) {
      return { nonce, headerHash, attempts };
    }

    nonce = (nonce + 1) >>> 0;
  }

  throw new PoWError("Unable to satisfy PoW difficulty within uint32 nonce space.");
}

export function getPowScore(headerHash: Uint8Array): number {
  return countLeadingZeroBits(headerHash);
}

/**
 * Compares two envelopes by their Proof-of-Work score for prioritization.
 * Returns a negative number if 'a' has more work than 'b', positive if less,
 * and zero if equal. Useful for sort() functions to place higher work first.
 */
export function compareEnvelopesByPoW(a: VcoEnvelope, b: VcoEnvelope): number {
  const scoreA = getPowScore(a.headerHash);
  const scoreB = getPowScore(b.headerHash);
  return scoreB - scoreA;
}

/**
 * Compares two envelopes by their Priority Hint first, then by Proof-of-Work score.
 * Returns a negative number if 'a' is higher priority than 'b', positive if lower,
 * and zero if equal.
 *
 * @param a The first envelope to compare.
 * @param b The second envelope to compare.
 * @returns A number indicating the relative priority.
 */
export function compareEnvelopesByPriorityAndPoW(a: VcoEnvelope, b: VcoEnvelope): number {
  const priorityA = a.header.priorityHint ?? 0;
  const priorityB = b.header.priorityHint ?? 0;
  
  if (priorityA !== priorityB) {
    return priorityB - priorityA;
  }

  return compareEnvelopesByPoW(a, b);
}
