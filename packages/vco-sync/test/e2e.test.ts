import { describe, expect, it } from "vitest";
import {
  assertEnvelopeIntegrity,
  createEnvelope,
  decodeEnvelopeProto,
  encodeEnvelopeProto,
  EnvelopeValidationError,
  FLAG_POW_ACTIVE,
  getPowScore,
  verifyPoW,
  VCOCore,
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
});
