import {
  blake3,
  createNobleCryptoProvider,
  deriveEd25519Multikey,
} from "../../vco-crypto/src/index.ts";
import { describe, expect, it } from "vitest";
import {
  MAX_VCO_SIZE,
  MULTICODEC_PROTOBUF,
  assertPayloadFragmentSetIntegrity,
  createEnvelope,
  encodeBlake3Multihash,
  fragmentEnvelopePayload,
  fragmentPayload,
  reassemblePayloadFragments,
} from "../src/index.js";

function keyFromSeed(seed: number): Uint8Array {
  const key = new Uint8Array(32);
  key.fill(seed);
  return key;
}

/** Deterministic context fixture for fragmentPayload calls that bypass envelope creation. */
function makeContext(payload: Uint8Array) {
  return {
    parentHeaderHash: new Uint8Array(32).fill(0xab),
    payloadHash: encodeBlake3Multihash(blake3(payload)),
  };
}

/**
 * Fisher-Yates shuffle using a deterministic LCG seeded from array length so
 * tests are reproducible without importing an RNG library.
 */
function shuffleDeterministic<T>(array: T[]): T[] {
  const copy = [...array];
  let seed = BigInt(copy.length) * 6364136223846793005n;
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 6364136223846793005n + 1442695040888963407n) & 0xffffffffffffffffn;
    const j = Number(seed % BigInt(i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

describe("fragmentation edge cases", () => {
  // -----------------------------------------------------------------------
  // 1. Exactly MAX_VCO_SIZE payload
  // -----------------------------------------------------------------------
  describe("exactly MAX_VCO_SIZE payload (4,194,304 bytes)", () => {
    it("fragments and reassembles a payload of exactly MAX_VCO_SIZE bytes via fragmentPayload", () => {
      const payload = new Uint8Array(MAX_VCO_SIZE);
      // Fill with a non-trivial pattern so a naive zero-check cannot mask bugs.
      for (let i = 0; i < payload.length; i++) {
        payload[i] = i & 0xff;
      }

      // Use a chunk size smaller than MAX_VCO_SIZE so we actually get multiple
      // fragments and exercise the full split/reassemble path.
      const chunkSize = MAX_VCO_SIZE / 4; // 1 MiB chunks → 4 fragments
      const fragmentSet = fragmentPayload(payload, makeContext(payload), chunkSize);

      expect(fragmentSet.fragments).toHaveLength(4);
      expect(fragmentSet.fragments.map((f) => f.fragmentIndex)).toEqual([0, 1, 2, 3]);
      expect(fragmentSet.fragments[0].totalPayloadSize).toBe(MAX_VCO_SIZE);

      const reassembled = reassemblePayloadFragments(fragmentSet);
      expect(reassembled.length).toBe(MAX_VCO_SIZE);
      expect(Array.from(reassembled)).toEqual(Array.from(payload));
    });

    it("produces a single fragment when chunk size equals MAX_VCO_SIZE", () => {
      const payload = new Uint8Array(MAX_VCO_SIZE).fill(0x7f);
      const fragmentSet = fragmentPayload(payload, makeContext(payload), MAX_VCO_SIZE);

      expect(fragmentSet.fragments).toHaveLength(1);
      expect(fragmentSet.fragments[0].fragmentCount).toBe(1);
      expect(fragmentSet.fragments[0].fragmentIndex).toBe(0);

      expect(() => assertPayloadFragmentSetIntegrity(fragmentSet)).not.toThrow();
      const reassembled = reassemblePayloadFragments(fragmentSet);
      expect(reassembled.length).toBe(MAX_VCO_SIZE);
    });
  });

  // -----------------------------------------------------------------------
  // 2. One byte under MAX_VCO_SIZE
  // -----------------------------------------------------------------------
  describe("one byte under MAX_VCO_SIZE payload (4,194,303 bytes)", () => {
    it("succeeds via fragmentPayload without error", () => {
      const payload = new Uint8Array(MAX_VCO_SIZE - 1).fill(0x55);
      const chunkSize = MAX_VCO_SIZE / 4;
      const fragmentSet = fragmentPayload(payload, makeContext(payload), chunkSize);

      // MAX_VCO_SIZE - 1 = 4194303; chunkSize = 1048576.
      // 4194303 / 1048576 = 3 full chunks + 1048575 remainder → 4 fragments.
      expect(fragmentSet.fragments).toHaveLength(4);

      const reassembled = reassemblePayloadFragments(fragmentSet);
      expect(reassembled.length).toBe(MAX_VCO_SIZE - 1);
      expect(Array.from(reassembled)).toEqual(Array.from(payload));
    });

    it("succeeds via fragmentEnvelopePayload (envelope path) with sub-chunk size", () => {
      const crypto = createNobleCryptoProvider();
      const privateKey = keyFromSeed(53);
      const creatorId = deriveEd25519Multikey(privateKey);

      // MAX_VCO_SIZE - 1 is within the envelope payload size limit, so
      // validateEnvelope must accept it.
      const payload = new Uint8Array(MAX_VCO_SIZE - 1).fill(0xaa);

      const envelope = createEnvelope(
        {
          payload,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId,
          privateKey,
        },
        crypto,
      );

      // Fragment with a small explicit chunk size to exercise the split path
      // without allocating additional multi-MiB buffers.
      const chunkSize = 512 * 1024; // 512 KiB
      const fragmentSet = fragmentEnvelopePayload(envelope, chunkSize);

      expect(() => assertPayloadFragmentSetIntegrity(fragmentSet)).not.toThrow();

      const reassembled = reassemblePayloadFragments(fragmentSet);
      expect(reassembled.length).toBe(MAX_VCO_SIZE - 1);
      expect(Array.from(reassembled)).toEqual(Array.from(payload));
    });
  });

  // -----------------------------------------------------------------------
  // 3. Out-of-order fragment reassembly
  // -----------------------------------------------------------------------
  describe("out-of-order fragment reassembly", () => {
    it("reassembles correctly regardless of fragment submission order", () => {
      const crypto = createNobleCryptoProvider();
      const privateKey = keyFromSeed(59);
      const creatorId = deriveEd25519Multikey(privateKey);

      // 17 bytes split into 4-byte chunks → 5 fragments (4+4+4+4+1).
      const payload = new Uint8Array([
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
        110, 120, 130, 140, 150, 160, 170,
      ]);

      const envelope = createEnvelope(
        {
          payload,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId,
          privateKey,
        },
        crypto,
      );

      const fragmentSet = fragmentEnvelopePayload(envelope, 4);
      expect(fragmentSet.fragments).toHaveLength(5);

      // Shuffle fragments deterministically; verify order actually changed.
      const shuffled = shuffleDeterministic(fragmentSet.fragments);
      const shuffledIndexes = shuffled.map((f) => f.fragmentIndex);
      expect(shuffledIndexes).not.toEqual([0, 1, 2, 3, 4]);

      const shuffledSet = { fragments: shuffled };
      expect(() => assertPayloadFragmentSetIntegrity(shuffledSet)).not.toThrow();

      const reassembled = reassemblePayloadFragments(shuffledSet);
      expect(Array.from(reassembled)).toEqual(Array.from(payload));
    });

    it("reassembles a large shuffled payload with correct byte values", () => {
      const payload = new Uint8Array(100);
      for (let i = 0; i < 100; i++) payload[i] = (i * 7 + 3) & 0xff;

      const fragmentSet = fragmentPayload(payload, makeContext(payload), 13);
      // 100 / 13 = 7 full chunks + 9 remainder → 8 fragments
      expect(fragmentSet.fragments).toHaveLength(8);

      const shuffled = shuffleDeterministic(fragmentSet.fragments);
      const reassembled = reassemblePayloadFragments({ fragments: shuffled });

      expect(Array.from(reassembled)).toEqual(Array.from(payload));
    });
  });

  // -----------------------------------------------------------------------
  // 4. Duplicate fragment handling
  // -----------------------------------------------------------------------
  describe("duplicate fragment handling", () => {
    it("assertPayloadFragmentSetIntegrity throws on duplicate fragmentIndex", () => {
      const crypto = createNobleCryptoProvider();
      const privateKey = keyFromSeed(61);
      const creatorId = deriveEd25519Multikey(privateKey);

      const envelope = createEnvelope(
        {
          payload: new Uint8Array([1, 2, 3, 4, 5, 6]),
          payloadType: MULTICODEC_PROTOBUF,
          creatorId,
          privateKey,
        },
        crypto,
      );

      const fragmentSet = fragmentEnvelopePayload(envelope, 3);
      expect(fragmentSet.fragments).toHaveLength(2);

      // Submit fragment at index 0 twice.
      const duplicate = { ...fragmentSet.fragments[0] };
      const withDuplicate = {
        fragments: [...fragmentSet.fragments, duplicate],
      };

      expect(() => assertPayloadFragmentSetIntegrity(withDuplicate)).toThrow(
        /duplicate fragmentIndex/i,
      );
    });

    it("reassemblePayloadFragments throws (does not silently double-count) on duplicate", () => {
      const payload = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]);
      const fragmentSet = fragmentPayload(payload, makeContext(payload), 3);
      expect(fragmentSet.fragments).toHaveLength(3);

      const duplicate = { ...fragmentSet.fragments[1] };
      const withDuplicate = { fragments: [...fragmentSet.fragments, duplicate] };

      // reassemblePayloadFragments calls assertPayloadFragmentSetIntegrity first,
      // so it must throw rather than silently producing corrupt output.
      expect(() => reassemblePayloadFragments(withDuplicate)).toThrow(
        /duplicate fragmentIndex/i,
      );
    });

    it("original fragment set is unmodified after duplicate-set operations throw", () => {
      const payload = new Uint8Array([255, 0, 128, 64, 32]);
      const fragmentSet = fragmentPayload(payload, makeContext(payload), 2);

      // Confirm the clean set assembles correctly.
      const clean = reassemblePayloadFragments(fragmentSet);
      expect(Array.from(clean)).toEqual(Array.from(payload));

      // Constructing a duplicate set and attempting reassembly must throw.
      const withDuplicate = {
        fragments: [...fragmentSet.fragments, { ...fragmentSet.fragments[0] }],
      };
      expect(() => reassemblePayloadFragments(withDuplicate)).toThrow();

      // The original fragmentSet must remain unmodified and still valid.
      const cleanAgain = reassemblePayloadFragments(fragmentSet);
      expect(Array.from(cleanAgain)).toEqual(Array.from(payload));
    });
  });

  // -----------------------------------------------------------------------
  // 5. Missing final fragment — partial reassembly behaviour
  // -----------------------------------------------------------------------
  describe("missing final fragment", () => {
    it("assertPayloadFragmentSetIntegrity throws when the last fragment is absent", () => {
      const crypto = createNobleCryptoProvider();
      const privateKey = keyFromSeed(67);
      const creatorId = deriveEd25519Multikey(privateKey);

      const envelope = createEnvelope(
        {
          payload: new Uint8Array([10, 20, 30, 40, 50, 60, 70]),
          payloadType: MULTICODEC_PROTOBUF,
          creatorId,
          privateKey,
        },
        crypto,
      );

      // 7 bytes, chunk 3 → fragments [0,1,2] (chunks: 3+3+1)
      const fragmentSet = fragmentEnvelopePayload(envelope, 3);
      expect(fragmentSet.fragments).toHaveLength(3);

      const partial = {
        fragments: fragmentSet.fragments.filter((f) => f.fragmentIndex !== 2),
      };
      expect(partial.fragments).toHaveLength(2);

      expect(() => assertPayloadFragmentSetIntegrity(partial)).toThrow(
        /missing fragment index/i,
      );
    });

    it("reassemblePayloadFragments does not produce output for N-1 fragments", () => {
      const payload = new Uint8Array(20);
      for (let i = 0; i < 20; i++) payload[i] = i;

      // 20 / 5 = 4 fragments exactly
      const fragmentSet = fragmentPayload(payload, makeContext(payload), 5);
      expect(fragmentSet.fragments).toHaveLength(4);

      const partial = {
        fragments: fragmentSet.fragments.filter((f) => f.fragmentIndex !== 3),
      };

      // Must throw — no partial output is permitted.
      expect(() => reassemblePayloadFragments(partial)).toThrow(/missing fragment index/i);
    });

    it("throws when the first fragment is absent (not just the last)", () => {
      const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const fragmentSet = fragmentPayload(payload, makeContext(payload), 4);
      expect(fragmentSet.fragments).toHaveLength(2);

      const partial = {
        fragments: fragmentSet.fragments.filter((f) => f.fragmentIndex !== 0),
      };

      expect(() => assertPayloadFragmentSetIntegrity(partial)).toThrow(
        /missing fragment index/i,
      );
    });

    it("throws when a middle fragment is absent", () => {
      const payload = new Uint8Array(15).fill(0x33);
      // 15 / 4 = 3 full + 3 remainder → 4 fragments
      const fragmentSet = fragmentPayload(payload, makeContext(payload), 4);
      expect(fragmentSet.fragments).toHaveLength(4);

      const partial = {
        fragments: fragmentSet.fragments.filter((f) => f.fragmentIndex !== 2),
      };

      expect(() => assertPayloadFragmentSetIntegrity(partial)).toThrow(
        /missing fragment index/i,
      );
    });

    it("does not retain mutable state across separate calls with partial sets", () => {
      // Verify that assertPayloadFragmentSetIntegrity allocates no module-level
      // or closure-level state — calling it repeatedly with the same partial set
      // must produce identical errors, and calling it with the full set afterward
      // must succeed.
      const payload = new Uint8Array(9).fill(0x11);
      const fragmentSet = fragmentPayload(payload, makeContext(payload), 3);
      expect(fragmentSet.fragments).toHaveLength(3);

      const partial = {
        fragments: fragmentSet.fragments.filter((f) => f.fragmentIndex !== 2),
      };

      expect(() => assertPayloadFragmentSetIntegrity(partial)).toThrow(
        /missing fragment index/i,
      );
      expect(() => assertPayloadFragmentSetIntegrity(partial)).toThrow(
        /missing fragment index/i,
      );

      // Complete set must still pass cleanly after the failed calls.
      expect(() => assertPayloadFragmentSetIntegrity(fragmentSet)).not.toThrow();
    });
  });
});
