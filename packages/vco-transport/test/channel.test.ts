import type { Stream } from "@libp2p/interface";
import { describe, expect, it } from "vitest";
import {
  Libp2pSessionChannel,
  TransportSession,
  ZeroRandomSource,
} from "../src/index.js";

class MockStream {
  peer?: MockStream;
  private readonly queue: Uint8Array[] = [];
  private readonly waiters: Array<(result: IteratorResult<Uint8Array>) => void> = [];
  private remoteClosed = false;

  public readonly source: AsyncIterable<Uint8Array> = {
    [Symbol.asyncIterator]: () => {
      return {
        next: async () => {
          const queued = this.queue.shift();
          if (queued) {
            return { done: false, value: queued };
          }

          if (this.remoteClosed) {
            return { done: true, value: undefined };
          }

          return new Promise<IteratorResult<Uint8Array>>((resolve) => {
            this.waiters.push(resolve);
          });
        },
      };
    },
  };

  async sink(source: AsyncIterable<Uint8Array>): Promise<void> {
    for await (const payload of source) {
      this.peer?.enqueue(Uint8Array.from(payload));
    }
  }

  async close(): Promise<void> {
    if (this.peer) {
      this.peer.notifyRemoteClosed();
    }
  }

  notifyRemoteClosed(): void {
    this.remoteClosed = true;
    this.flushWaitersIfDone();
  }

  enqueue(payload: Uint8Array): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter({ done: false, value: payload });
      return;
    }

    this.queue.push(payload);
  }

  private flushWaitersIfDone(): void {
    if (!this.remoteClosed) {
      return;
    }

    while (this.waiters.length > 0) {
      const waiter = this.waiters.shift();
      waiter?.({ done: true, value: undefined });
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

describe("Libp2pSessionChannel", () => {
  it("sends and receives payloads over a stream pair", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const left = new Libp2pSessionChannel(leftStream as unknown as Stream, { session: createSession() });
    const right = new Libp2pSessionChannel(rightStream as unknown as Stream, { session: createSession() });
    const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    await left.send(payload);
    const received = await right.receive();

    expect(Array.from(received)).toEqual(Array.from(payload));
  });

  it("supports sequential payload exchange on one stream", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const left = new Libp2pSessionChannel(leftStream as unknown as Stream, { session: createSession() });
    const right = new Libp2pSessionChannel(rightStream as unknown as Stream, { session: createSession() });

    await left.send(new Uint8Array([9, 8, 7]));
    await left.send(new Uint8Array([4, 3, 2, 1]));

    const first = await right.receive();
    const second = await right.receive();

    expect(Array.from(first)).toEqual([9, 8, 7]);
    expect(Array.from(second)).toEqual([4, 3, 2, 1]);
  });

  it("fails when incoming transport payload cannot be decoded", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const right = new Libp2pSessionChannel(rightStream as unknown as Stream, { session: createSession() });

    rightStream.enqueue(new TextEncoder().encode("not-json"));

    await expect(async () => right.receive()).rejects.toThrow(/decode/i);
  });
});
