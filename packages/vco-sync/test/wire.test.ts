import { describe, expect, it } from "vitest";
import {
  decodePowChallenge,
  decodeRangeProofs,
  decodeSyncWireMessage,
  encodePowChallenge,
  encodeRangeProofs,
  encodeSyncWireMessage,
  encodeInterestVector,
  decodeInterestVector,
  type SyncWireRange,
} from "../src/index.js";
import { vco } from "../src/generated/vco.pb.js";

describe("sync wire protobuf adapter", () => {
  it("encodes and decodes raw sync ranges through protobuf", () => {
    const ranges: SyncWireRange[] = [
      {
        startHash: new Uint8Array([0x00]),
        endHash: new Uint8Array([0x7f]),
        fingerprint: new Uint8Array([1, 2, 3]),
      },
      {
        startHash: new Uint8Array([0x80]),
        endHash: new Uint8Array([0xff]),
        fingerprint: new Uint8Array([4, 5, 6]),
      },
    ];

    const encoded = encodeSyncWireMessage(ranges);
    const decoded = decodeSyncWireMessage(encoded);

    expect(decoded).toEqual(ranges);
  });

  it("encodes and decodes range proofs using single-byte hash bounds", () => {
    const encoded = encodeRangeProofs([
      {
        range: { start: 0x00, end: 0x7f },
        merkleRoot: new Uint8Array([0xaa, 0xbb]),
      },
      {
        range: { start: 0x80, end: 0xff },
        merkleRoot: new Uint8Array([0xcc, 0xdd]),
      },
    ]);

    const decoded = decodeRangeProofs(encoded);
    expect(decoded).toEqual([
      {
        range: { start: 0x00, end: 0x7f },
        merkleRoot: new Uint8Array([0xaa, 0xbb]),
      },
      {
        range: { start: 0x80, end: 0xff },
        merkleRoot: new Uint8Array([0xcc, 0xdd]),
      },
    ]);
  });

  it("rejects range-proof decoding when bounds are not one byte", () => {
    const encoded = encodeSyncWireMessage([
      {
        startHash: new Uint8Array([0x00, 0x01]),
        endHash: new Uint8Array([0xff]),
        fingerprint: new Uint8Array([0x01]),
      },
    ]);

    expect(() => decodeRangeProofs(encoded)).toThrow(/exactly 1 byte/i);
  });

  it("rejects invalid range proof bounds", () => {
    expect(() =>
      encodeRangeProofs([
        {
          range: { start: 0x80, end: 0x40 },
          merkleRoot: new Uint8Array([1]),
        },
      ]),
    ).toThrow(/must be <=/i);
  });

  it("encodes and decodes PowChallenge messages", () => {
    const encoded = encodePowChallenge({
      minDifficulty: 20,
      ttlSeconds: 120,
      reason: "backpressure",
    });

    const decoded = decodePowChallenge(encoded);
    expect(decoded).toEqual({
      minDifficulty: 20,
      ttlSeconds: 120,
      reason: "backpressure",
    });
  });

  it("rejects invalid PowChallenge difficulty values", () => {
    expect(() =>
      encodePowChallenge({
        minDifficulty: 300,
        ttlSeconds: 60,
      }),
    ).toThrow(/minDifficulty/i);
  });

  it("encodes and decodes InterestVector messages", () => {
    const targetCids = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];
    const encoded = encodeInterestVector(targetCids, vco.v3.PriorityLevel.PRIORITY_HIGH);
    const decoded = decodeInterestVector(encoded);

    expect(decoded.targetCids).toEqual(targetCids);
    expect(decoded.priority).toBe(vco.v3.PriorityLevel.PRIORITY_HIGH);
  });
});
