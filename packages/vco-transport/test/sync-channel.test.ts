import type { Connection, StreamHandlerOptions } from "@libp2p/interface";
import type { Libp2pNode } from "../src/index.js";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_VCO_SYNC_PROTOCOL,
  Libp2pSessionChannel,
  TransportSession,
  ZeroRandomSource,
  handleSyncSessionChannels,
  openSyncSessionChannel,
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
    this.peer?.notifyRemoteClosed();
  }

  private notifyRemoteClosed(): void {
    this.remoteClosed = true;
    while (this.waiters.length > 0) {
      const waiter = this.waiters.shift();
      waiter?.({ done: true, value: undefined });
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

describe("sync channel helpers", () => {
  it("opens an outbound sync session channel on a connection", async () => {
    const [dialerStream, responderStream] = createStreamPair();
    let requestedProtocol = "";

    const connection = {
      newStream: async (protocol: string) => {
        requestedProtocol = protocol;
        return dialerStream;
      },
    } as unknown as Connection;

    const outbound = await openSyncSessionChannel(connection, {
      protocol: "/vco/sync/test",
      session: createSession(),
    });
    const inbound = new Libp2pSessionChannel(responderStream as any, { session: createSession() });
    await outbound.send(new Uint8Array([1, 2, 3]));
    const received = await inbound.receive();

    expect(requestedProtocol).toBe("/vco/sync/test");
    expect(Array.from(received)).toEqual([1, 2, 3]);
  });

  it("registers inbound handler and invokes it with a session channel", async () => {
    const [initiatorStream, responderStream] = createStreamPair();
    const streamHandlerOptions: StreamHandlerOptions = { maxInboundStreams: 2 };
    let registeredProtocol = "";
    let registeredHandler:
      | ((data: { stream: any; connection: Connection }) => Promise<void>)
      | undefined;
    let registeredOptions: StreamHandlerOptions | undefined;
    let receivedPayload: Uint8Array | undefined;

    const node = {
      handle: async (protocol: string, handler: any, options?: StreamHandlerOptions) => {
        registeredProtocol = protocol;
        registeredHandler = handler;
        registeredOptions = options;
      },
    } as unknown as Libp2pNode;

    await handleSyncSessionChannels(
      node,
      async (channel) => {
        receivedPayload = await channel.receive();
      },
      {
        session: createSession(),
        streamHandlerOptions,
      },
    );

    const peerChannel = new Libp2pSessionChannel(initiatorStream as any, { session: createSession() });
    const connection = {} as Connection;
    const handlePromise = registeredHandler?.({ stream: responderStream as any, connection });
    await peerChannel.send(new Uint8Array([9, 9, 9]));
    await handlePromise;

    expect(registeredProtocol).toBe(DEFAULT_VCO_SYNC_PROTOCOL);
    expect(registeredOptions).toEqual(streamHandlerOptions);
    expect(Array.from(receivedPayload ?? new Uint8Array())).toEqual([9, 9, 9]);
  });
});
