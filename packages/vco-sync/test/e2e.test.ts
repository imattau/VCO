import { describe, expect, it } from "vitest";
import {
  assertEnvelopeIntegrity,
  createEnvelope,
  decodeEnvelopeProto,
  encodeEnvelopeProto,
  EnvelopeValidationError,
  FLAG_POW_ACTIVE,
  FLAG_ZKP_AUTH,
  getPowScore,
  verifyPoW,
  VCOCore,
  fragmentPayload,
  reassemblePayloadFragments,
  validateEnvelope,
} from "../../vco-core/src/index.js";
import {
  NobleCryptoProvider,
  deriveEd25519Multikey,
} from "../../vco-crypto/src/index.js";
import {
  Libp2pSessionChannel,
  TransportSession,
  ZeroRandomSource,
} from "../../vco-transport/src/index.js";
import { admitInboundEnvelope } from "../src/index.js";
import { SyncRangeProofProtocol } from "../src/index.js";
import {
  encodeSyncWireMessage,
  encodePowChallenge,
  decodeSyncControlKind,
} from "../src/index.js";

// ---------------------------------------------------------------------------
// Helpers shared across tests
// ---------------------------------------------------------------------------

const crypto = new NobleCryptoProvider();

// Fixed deterministic seed so tests are repeatable
const PRIVATE_KEY = new Uint8Array(32).fill(0x42);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEnvelope(opts: { powDifficulty?: number } = {}) {
  return createEnvelope(
    {
      payload: new TextEncoder().encode("hello vco"),
      payloadType: 1,
      creatorId: CREATOR_ID,
      privateKey: PRIVATE_KEY,
      powDifficulty: opts.powDifficulty ?? 0,
    },
    crypto,
  );
}

// ---------------------------------------------------------------------------
// MockStream (same pattern as transport.integration.test.ts)
// ---------------------------------------------------------------------------

class MockStream {
  peer?: MockStream;
  private readonly queue: Uint8Array[] = [];
  private readonly waiters: Array<(result: IteratorResult<Uint8Array>) => void> = [];
  private remoteClosed = false;

  public readonly source: AsyncIterable<Uint8Array> = {
    [Symbol.asyncIterator]: () => ({
      next: async () => {
        const queued = this.queue.shift();
        if (queued) return { done: false as const, value: queued };
        if (this.remoteClosed) return { done: true as const, value: undefined };
        return new Promise<IteratorResult<Uint8Array>>((resolve) => {
          this.waiters.push(resolve);
        });
      },
    }),
  };

  async sink(source: AsyncIterable<Uint8Array>): Promise<void> {
    for await (const payload of source) {
      this.peer?.enqueue(Uint8Array.from(payload));
    }
  }

  async close(): Promise<void> {
    this.peer?.notifyRemoteClosed();
  }

  private notifyRemoteClosed(): void {
    this.remoteClosed = true;
    while (this.waiters.length > 0) {
      this.waiters.shift()?.({ done: true, value: undefined });
    }
  }

  private enqueue(payload: Uint8Array): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter({ done: false, value: payload });
    } else {
      this.queue.push(payload);
    }
  }
}

function createStreamPair(): [MockStream, MockStream] {
  const left = new MockStream();
  const right = new MockStream();
  left.peer = right;
  right.peer = left;
  return [left, right];
}

function createSession(): TransportSession {
  return new TransportSession({
    frameSize: 8,
    randomSource: new ZeroRandomSource(),
    idleTimeoutSeconds: 60,
    now: () => 0,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("VCO protocol end-to-end", () => {
  // 1. Signed envelope roundtrip ------------------------------------------------
  it("signed envelope roundtrip: encode → decode → assertEnvelopeIntegrity", () => {
    const envelope = makeEnvelope();
    const encoded = encodeEnvelopeProto(envelope);
    const decoded = decodeEnvelopeProto(encoded);
    // Must not throw
    expect(() => assertEnvelopeIntegrity(decoded, crypto)).not.toThrow();
    expect(new TextDecoder().decode(decoded.payload)).toBe("hello vco");
  });

  // 2. Tampered payload rejected ------------------------------------------------
  it("tampered payload is rejected by assertEnvelopeIntegrity", () => {
    const envelope = makeEnvelope();
    const encoded = encodeEnvelopeProto(envelope);
    const decoded = decodeEnvelopeProto(encoded);
    // Mutate first byte of payload
    decoded.payload[0] ^= 0xff;
    expect(() => assertEnvelopeIntegrity(decoded, crypto)).toThrow(EnvelopeValidationError);
  });

  // 3. PoW solve and verify -----------------------------------------------------
  it("PoW envelope: FLAG_POW_ACTIVE set, score >= 4, verifyPoW returns true", () => {
    const envelope = makeEnvelope({ powDifficulty: 4 });
    expect(envelope.header.flags & FLAG_POW_ACTIVE).not.toBe(0);
    expect(getPowScore(envelope.headerHash)).toBeGreaterThanOrEqual(4);
    expect(verifyPoW(envelope.headerHash, 4)).toBe(true);
  });

  // 4. Envelope transmitted over transport channel ------------------------------
  it("envelope transmitted over Libp2pSessionChannel roundtrip", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const senderChannel = new Libp2pSessionChannel(leftStream as any, {
      session: createSession(),
    });
    const receiverChannel = new Libp2pSessionChannel(rightStream as any, {
      session: createSession(),
    });

    const envelope = makeEnvelope();
    const encoded = encodeEnvelopeProto(envelope);

    const receivePromise = receiverChannel.receive();
    await senderChannel.send(encoded);
    const received = await receivePromise;

    const decoded = decodeEnvelopeProto(received);
    assertEnvelopeIntegrity(decoded, crypto);
    expect(new TextDecoder().decode(decoded.payload)).toBe("hello vco");
  });

  // 5. PoW admission gate -------------------------------------------------------
  it("admitInboundEnvelope: passes with sufficient PoW, throws with insufficient PoW", async () => {
    const core = new VCOCore(crypto);

    // Envelope with powDifficulty: 4 - should be admitted at requiredDifficulty: 4
    const powEnvelope = makeEnvelope({ powDifficulty: 4 });
    const powEncoded = encodeEnvelopeProto(powEnvelope);
    await expect(
      admitInboundEnvelope(powEncoded, core, { requiredDifficulty: 4 }),
    ).resolves.toBeDefined();

    // Envelope with powDifficulty: 0 - should be rejected at requiredDifficulty: 4
    const noPowEnvelope = makeEnvelope({ powDifficulty: 0 });
    const noPowEncoded = encodeEnvelopeProto(noPowEnvelope);
    await expect(
      admitInboundEnvelope(noPowEncoded, core, { requiredDifficulty: 4 }),
    ).rejects.toThrow("Envelope lacks required PoW difficulty 4.");
  });

  // 6. ZKP_AUTH envelope roundtrip ----------------------------------------------
  it("ZKP_AUTH envelope: encode → decode → validateEnvelope passes, creatorId/signature zeroed", () => {
    const proof = new Uint8Array(32);
    globalThis.crypto.getRandomValues(proof);
    const publicInputs = new Uint8Array(16);
    globalThis.crypto.getRandomValues(publicInputs);
    const nullifier = new Uint8Array(32);
    globalThis.crypto.getRandomValues(nullifier);

    const envelope = createEnvelope(
      {
        payload: new TextEncoder().encode("zkp payload"),
        payloadType: 1,
        flags: FLAG_ZKP_AUTH,
        zkpExtension: {
          circuitId: 1,
          proof,
          proofLength: 32,
          publicInputs,
          inputsLength: 16,
          nullifier,
        },
      },
      crypto,
    );

    const encoded = encodeEnvelopeProto(envelope);
    const decoded = decodeEnvelopeProto(encoded);

    // Must not throw
    expect(() => validateEnvelope(decoded)).not.toThrow();

    // creatorId must be empty or zeroed
    const creatorIdAllZero = decoded.header.creatorId.length === 0 ||
      decoded.header.creatorId.every((b) => b === 0);
    expect(creatorIdAllZero).toBe(true);

    // signature must be empty or zeroed
    const sigAllZero = decoded.header.signature.length === 0 ||
      decoded.header.signature.every((b) => b === 0);
    expect(sigAllZero).toBe(true);
  });

  // 7. ZKP nullifier replay prevention via VCOCore ------------------------------
  it("VCOCore.validateEnvelope: rejects replayed nullifier on second call", async () => {
    const nullifier = new Uint8Array(32);
    globalThis.crypto.getRandomValues(nullifier);
    const proof = new Uint8Array(32);
    globalThis.crypto.getRandomValues(proof);
    const publicInputs = new Uint8Array(16);
    globalThis.crypto.getRandomValues(publicInputs);

    const envelope = createEnvelope(
      {
        payload: new TextEncoder().encode("zkp replay test"),
        payloadType: 1,
        flags: FLAG_ZKP_AUTH,
        zkpExtension: {
          circuitId: 1,
          proof,
          proofLength: 32,
          publicInputs,
          inputsLength: 16,
          nullifier,
        },
      },
      crypto,
    );

    const core = new VCOCore(crypto);
    core.registerVerifier({
      circuitId: 1,
      verify: async () => true,
    });

    // First call should succeed
    const firstResult = await core.validateEnvelope(envelope);
    expect(firstResult).toBe(true);

    // Second call with same nullifier should be rejected (replay prevention)
    const secondResult = await core.validateEnvelope(envelope);
    expect(secondResult).toBe(false);
  });

  // 8. Fragmentation roundtrip --------------------------------------------------
  it("fragmentation roundtrip: 1.5MB payload fragments and reassembles byte-for-byte", () => {
    const payloadSize = 1.5 * 1024 * 1024; // 1.5 MB
    const originalPayload = new Uint8Array(payloadSize);
    // crypto.getRandomValues is limited to 65536 bytes per call; fill in chunks
    for (let off = 0; off < originalPayload.length; off += 65536) {
      globalThis.crypto.getRandomValues(originalPayload.subarray(off, Math.min(off + 65536, originalPayload.length)));
    }

    // Use a fake parentHeaderHash (32 bytes) and a valid blake3 multihash payloadHash
    // Build a minimal envelope to use fragmentEnvelopePayload, or use fragmentPayload directly
    // fragmentPayload needs parentHeaderHash (32 bytes) and payloadHash (valid multihash)
    // Compute a real payloadHash via NobleCryptoProvider
    const payloadDigest = crypto.digest(originalPayload);
    // encodeBlake3Multihash is exported from vco-core
    // Let's just use a real envelope for the context
    const envelope = createEnvelope(
      {
        payload: new TextEncoder().encode("seed"),
        payloadType: 1,
        creatorId: CREATOR_ID,
        privateKey: PRIVATE_KEY,
      },
      crypto,
    );

    // Use fragmentPayload with a chunk size of 512KB so we get ~3 fragments
    const CHUNK_SIZE = 512 * 1024;

    // Build payloadHash multihash for the big payload
    const bigPayloadHash = (() => {
      // Multihash format: varint(0x1e) + varint(32) + digest
      // 0x1e = 30, 32 = 0x20; both fit in one varint byte
      const digest = crypto.digest(originalPayload);
      const mh = new Uint8Array(2 + digest.length);
      mh[0] = 0x1e;
      mh[1] = 0x20;
      mh.set(digest, 2);
      return mh;
    })();

    const fragmentSet = fragmentPayload(
      originalPayload,
      {
        parentHeaderHash: envelope.headerHash,
        payloadHash: bigPayloadHash,
      },
      CHUNK_SIZE,
    );

    expect(fragmentSet.fragments.length).toBeGreaterThan(1);

    const reassembled = reassemblePayloadFragments(fragmentSet);

    expect(reassembled.length).toBe(originalPayload.length);
    expect(reassembled).toEqual(originalPayload);
  });

  // 9. Sync EXCHANGE phase with real envelopes ----------------------------------
  it("sync EXCHANGE: 3 real signed envelopes sent and verified over transport channel", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const senderChannel = new Libp2pSessionChannel(leftStream as any, {
      session: createSession(),
    });
    const receiverChannel = new Libp2pSessionChannel(rightStream as any, {
      session: createSession(),
    });

    const payloads = ["payload one", "payload two", "payload three"];
    const envelopes = payloads.map((text) =>
      createEnvelope(
        {
          payload: new TextEncoder().encode(text),
          payloadType: 1,
          creatorId: CREATOR_ID,
          privateKey: PRIVATE_KEY,
        },
        crypto,
      )
    );

    // Send all 3
    for (const envelope of envelopes) {
      await senderChannel.send(encodeEnvelopeProto(envelope));
    }

    // Receive all 3
    for (let i = 0; i < 3; i++) {
      const received = await receiverChannel.receive();
      const decoded = decodeEnvelopeProto(received);
      assertEnvelopeIntegrity(decoded, crypto);
      expect(new TextDecoder().decode(decoded.payload)).toBe(payloads[i]);
    }
  });

  // 10. PoW challenge mid-sync over transport ------------------------------------
  it("PoW challenge mid-sync: server challenge accepted, no-PoW envelope rejected", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const serverChannel = new Libp2pSessionChannel(rightStream as any, {
      session: createSession(),
    });
    const clientChannel = new Libp2pSessionChannel(leftStream as any, {
      session: createSession(),
    });

    let clientReceivedDifficulty = 0;
    const clientProtocol = new SyncRangeProofProtocol(clientChannel, {
      onPowChallenge: (challenge) => {
        clientReceivedDifficulty = challenge.minDifficulty;
      },
    });
    const serverProtocol = new SyncRangeProofProtocol(serverChannel);

    // Server sends PoW challenge
    await serverProtocol.sendPowChallenge({ minDifficulty: 3, ttlSeconds: 60 });

    // Client receives it via receiveRangeProofs (which handles pow_challenge internally)
    // But we need to trigger client to receive the challenge first.
    // sendPowChallenge sends; client needs to receive.
    // We'll have client call receivePowChallenge directly.
    const challenge = await clientProtocol.receivePowChallenge();
    expect(challenge.minDifficulty).toBe(3);
    expect(clientReceivedDifficulty).toBe(3);

    // Client creates a PoW envelope and sends it
    const powEnvelope = makeEnvelope({ powDifficulty: 3 });
    const powEncoded = encodeEnvelopeProto(powEnvelope);
    const core = new VCOCore(crypto);

    // Server admits envelope with requiredDifficulty: 3 — must pass
    await expect(
      admitInboundEnvelope(powEncoded, core, { requiredDifficulty: 3 }),
    ).resolves.toBeDefined();

    // No-PoW envelope must be rejected with requiredDifficulty: 3
    const noPowEnvelope = makeEnvelope({ powDifficulty: 0 });
    const noPowEncoded = encodeEnvelopeProto(noPowEnvelope);
    await expect(
      admitInboundEnvelope(noPowEncoded, core, { requiredDifficulty: 3 }),
    ).rejects.toThrow("Envelope lacks required PoW difficulty 3.");
  });

  // 11. Reserved flag bits rejected ---------------------------------------------
  it("reserved flag bits in flags field cause validateEnvelope to throw", () => {
    // flags: 0x0f sets all 4 reserved bits (bits 0-3)
    // We can't use createEnvelope because it calls validateEnvelope internally,
    // so we craft the rejection by building a minimal envelope with flags=0x0f
    // and calling validateEnvelope directly.
    const base = makeEnvelope();
    const mutated = {
      ...base,
      header: {
        ...base.header,
        flags: 0x0f,
      },
    };
    expect(() => validateEnvelope(mutated)).toThrow(/reserve/i);
  });

  // 12. Version enforcement -----------------------------------------------------
  it("version mismatch causes validateEnvelope to throw mentioning version", () => {
    const envelope = makeEnvelope();
    const mutated = {
      ...envelope,
      header: {
        ...envelope.header,
        version: 2,
      },
    };
    expect(() => validateEnvelope(mutated)).toThrow(/version/i);
  });

  // 13. SyncControl oneof exclusivity ------------------------------------------
  it("decodeSyncControlKind throws when both syncMessage and powChallenge are set", () => {
    // Construct a SyncControl with both fields by concatenating two valid
    // SyncControl protobuf messages. In protobuf binary format, concatenation
    // merges fields, so the decoder sees both oneof alternatives simultaneously.
    const syncMessageBytes = encodeSyncWireMessage([
      {
        startHash: new Uint8Array([0x00]),
        endHash: new Uint8Array([0xff]),
        fingerprint: new Uint8Array(32),
      },
    ]);

    const powChallengeBytes = encodePowChallenge({
      minDifficulty: 4,
      ttlSeconds: 60,
      reason: "test",
    });

    // Concatenate: protobuf merges fields from both messages into one
    const bothFields = new Uint8Array(syncMessageBytes.length + powChallengeBytes.length);
    bothFields.set(syncMessageBytes, 0);
    bothFields.set(powChallengeBytes, syncMessageBytes.length);

    expect(() => decodeSyncControlKind(bothFields)).toThrow("exactly one");
  });
});
