import { describe, expect, it } from "vitest";
import {
  EnvelopeCryptoProvider,
  MULTICODEC_PROTOBUF,
  createEnvelope,
  encodeEd25519Multikey,
  encodeEnvelopeProto,
  VCOCore,
} from "@vco/vco-core";
import {
  TransportSession,
  ZeroRandomSource,
  Libp2pSessionChannel,
} from "../../vco-transport/src/index.js";
import { PowChallengePolicy } from "../src/index.js";
import { handleEnvelopeStream } from "../src/envelope-receiver.js";

class TestCryptoProvider implements EnvelopeCryptoProvider {
  digest(payload: Uint8Array): Uint8Array {
    const out = new Uint8Array(32);
    let sum = 0;
    for (let index = 0; index < payload.length; index += 1) {
      sum = (sum + payload[index] + index) & 0xff;
    }
    // Fill the output with the total sum to ensure any input change
    // affects the leading bits (PoW score).
    out.fill(sum);
    return out;
  }

  sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
    const digest = this.digest(message);
    const signature = new Uint8Array(64);
    for (let index = 0; index < signature.length; index += 1) {
      signature[index] = digest[index % digest.length] ^ privateKey[index % privateKey.length];
    }
    return signature;
  }

  verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean {
    const expected = this.sign(message, publicKey);
    return (
      signature.length === expected.length &&
      signature.every((value, index) => value === expected[index])
    );
  }
}

function createStreamPair() {
  class StreamMock {
    peer?: StreamMock;
    private readonly queue: Uint8Array[] = [];
    private readonly waiters: Array<(result: IteratorResult<Uint8Array>) => void> = [];
    private remoteClosed = false;

    public readonly source = {
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          const queued = this.queue.shift();
          if (queued) {
            return { done: false, value: queued };
          }
          if (this.remoteClosed) {
            return { done: true, value: undefined };
          }
          return new Promise<IteratorResult<Uint8Array>>((resolve) => this.waiters.push(resolve));
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
        return;
      }
      this.queue.push(payload);
    }
  }

  const left = new StreamMock();
  const right = new StreamMock();
  left.peer = right;
  right.peer = left;
  return [left, right] as const;
}

function createSession(): TransportSession {
  return new TransportSession({
    frameSize: 8,
    randomSource: new ZeroRandomSource(),
    idleTimeoutSeconds: 60,
    now: () => 0,
  });
}

function encodeSignedEnvelope(privateKey: Uint8Array, powDifficulty = 0): Uint8Array {
  const creatorId = encodeEd25519Multikey(privateKey);
  const envelope = createEnvelope(
    {
      payload: new Uint8Array([1, 2, 3]),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId,
      privateKey,
      powDifficulty,
    },
    new TestCryptoProvider(),
  );
  return encodeEnvelopeProto(envelope);
}

describe("envelope receiver", () => {
  it("delivers envelopes that meet required PoW", async () => {
    const [dialerStream, listenerStream] = createStreamPair();
    const dialer = new Libp2pSessionChannel(dialerStream as any, { session: createSession() });
    const listener = new Libp2pSessionChannel(listenerStream as any, { session: createSession() });
    const core = new VCOCore(new TestCryptoProvider());
    const policy = new PowChallengePolicy();
    policy.applyInboundChallenge({ minDifficulty: 5, ttlSeconds: 60, reason: "test" });

    const received: unknown[] = [];
    const receiver = handleEnvelopeStream(listener, core, {
      powPolicy: policy,
      onEnvelope: (envelope) => {
        received.push(envelope);
      },
    });

    const envelopeBytes = encodeSignedEnvelope(new Uint8Array(32).fill(9), 5);
    await dialer.send(envelopeBytes);
    await dialer.close();

    await receiver;
    await listener.close();
    expect(received).toHaveLength(1);
  });

  it("fails when difficulty is too low", async () => {
    const [dialerStream, listenerStream] = createStreamPair();
    const dialer = new Libp2pSessionChannel(dialerStream as any, { session: createSession() });
    const listener = new Libp2pSessionChannel(listenerStream as any, { session: createSession() });
    const core = new VCOCore(new TestCryptoProvider());
    const policy = new PowChallengePolicy();
    policy.applyInboundChallenge({ minDifficulty: 6, ttlSeconds: 60, reason: "test" });

    const receiver = handleEnvelopeStream(listener, core, {
      powPolicy: policy,
      onEnvelope: () => undefined,
    });

    const envelopeBytes = encodeSignedEnvelope(new Uint8Array(32).fill(7), 0);
    await dialer.send(envelopeBytes);
    await dialer.close();

    await expect(receiver).rejects.toThrow(/required PoW difficulty/);
    await listener.close();
  });

  it("honors explicit requiredDifficulty override", async () => {
    const [dialerStream, listenerStream] = createStreamPair();
    const dialer = new Libp2pSessionChannel(dialerStream as any, { session: createSession() });
    const listener = new Libp2pSessionChannel(listenerStream as any, { session: createSession() });
    const core = new VCOCore(new TestCryptoProvider());

    const receiver = handleEnvelopeStream(listener, core, {
      requiredDifficulty: 3,
      onEnvelope: () => undefined,
    });

    const envelopeBytes = encodeSignedEnvelope(new Uint8Array(32).fill(7), 0);
    await dialer.send(envelopeBytes);
    await dialer.close();

    await expect(receiver).rejects.toThrow(/required PoW difficulty/);
    await listener.close();
  });
});
