import { describe, expect, it } from "vitest";
import {
  MerkleRangeProofBuilder,
  computeRangeFingerprint,
  type HeaderHashProvider,
} from "../src/index.js";

function hash(prefix: number, fill: number): Uint8Array {
  const out = new Uint8Array(32).fill(fill);
  out[0] = prefix;
  return out;
}

describe("range fingerprint", () => {
  it("computes identical fingerprints regardless of input ordering", async () => {
    const range = { start: 0x10, end: 0x10 };
    const hashesA = [hash(0x10, 1), hash(0x10, 2), hash(0x10, 3)];
    const hashesB = [hash(0x10, 3), hash(0x10, 1), hash(0x10, 2)];

    const left = await computeRangeFingerprint(range, hashesA);
    const right = await computeRangeFingerprint(range, hashesB);

    expect(Array.from(left)).toEqual(Array.from(right));
  });

  it("returns a deterministic non-empty fingerprint for empty ranges", async () => {
    const range = { start: 0x44, end: 0x44 };
    const hashes = [hash(0x10, 1), hash(0x11, 2)];
    const first = await computeRangeFingerprint(range, hashes);
    const second = await computeRangeFingerprint(range, hashes);

    expect(first.length).toBe(32);
    expect(Array.from(first)).toEqual(Array.from(second));
  });

  it("builds a range proof from a header-hash provider", async () => {
    const provider: HeaderHashProvider = {
      listHeaderHashes: async () => [hash(0x40, 9), hash(0x7f, 8), hash(0x80, 7)],
    };
    const builder = new MerkleRangeProofBuilder(provider);
    const proof = await builder.build({ start: 0x40, end: 0x7f });

    expect(proof.range).toEqual({ start: 0x40, end: 0x7f });
    expect(proof.merkleRoot.length).toBe(32);
  });
});
