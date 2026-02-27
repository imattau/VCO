import type { Connection, StreamHandlerOptions } from "@libp2p/interface";
import { describe, expect, it } from "vitest";
import {
  Libp2pSessionChannel,
  TransportSession,
  ZeroRandomSource,
  type Libp2pNode,
} from "../../vco-transport/src/index.ts";
import {
  SyncRangeProofProtocol,
  handleSyncSessionChannelsWithPowBackpressure,
} from "../src/index.js";
import type { SyncPowBackpressureContext } from "../src/libp2p-handler.js";

class MockStream {
  peer?: MockStream;
  private readonly queue: Uint8Array[] = [];
  private readonly waiters: Array<(result: IteratorResult<Uint8Array>) => void> = [];
  private remoteClosed = false;

  public readonly source: AsyncIterable<Uint8Array> = {
    [Symbol.asyncIterator]: () => ({
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

describe("handleSyncSessionChannelsWithPowBackpressure", () => {
  it("issues a PowChallenge before handing control to the sync handler", async () => {
    const [initiatorStream, responderStream] = createStreamPair();

    let registeredProtocol = "";
    let registeredHandler:
      | ((data: { stream: any; connection: Connection }) => Promise<void>)
      | undefined;
    let registeredOptions: StreamHandlerOptions | undefined;
    const streamHandlerOptions: StreamHandlerOptions = { maxInboundStreams: 2 };
    const node = {
      handle: async (protocol: string, handler: any, options?: StreamHandlerOptions) => {
        registeredProtocol = protocol;
        registeredHandler = handler;
        registeredOptions = options;
      },
    } as unknown as Libp2pNode;

    let receivedRangeRoots: number[] = [];
    let issuedChallengeDifficulty = -1;
    await handleSyncSessionChannelsWithPowBackpressure(
      node,
      async (protocol, _connection, context) => {
        issuedChallengeDifficulty = context.issuedChallenge?.minDifficulty ?? -1;
        const proofs = await protocol.receiveRangeProofs();
        receivedRangeRoots = proofs.map((proof) => proof.merkleRoot[0] ?? 0);
      },
      {
        session: createSession(),
        outboundMinDifficultyProvider: () => 23,
        outboundChallengeTtlSeconds: 120,
        outboundReasonProvider: () => "runtime load",
        streamHandlerOptions,
      },
    );

    const peerChannel = new Libp2pSessionChannel(initiatorStream as any, { session: createSession() });
    const peerProtocol = new SyncRangeProofProtocol(peerChannel);
    const handlePromise = registeredHandler?.({
      stream: responderStream as any,
      connection: {} as Connection,
    });

    const challenge = await peerProtocol.receivePowChallenge();
    await peerProtocol.sendRangeProofs([
      {
        range: { start: 0x00, end: 0xff },
        merkleRoot: new Uint8Array([7]),
      },
    ]);
    await handlePromise;

    expect(registeredProtocol).toBe("/vco/sync/3.2.0");
    expect(registeredOptions).toEqual(streamHandlerOptions);
    expect(challenge).toEqual({
      minDifficulty: 23,
      ttlSeconds: 120,
      reason: "runtime load",
    });
    expect(issuedChallengeDifficulty).toBe(23);
    expect(receivedRangeRoots).toEqual([7]);

    await peerChannel.close();
  });

  it("tracks remote required difficulty from inbound PowChallenge frames", async () => {
    const [initiatorStream, responderStream] = createStreamPair();

    let registeredHandler:
      | ((data: { stream: any; connection: Connection }) => Promise<void>)
      | undefined;
    const node = {
      handle: async (_protocol: string, handler: any) => {
        registeredHandler = handler;
      },
    } as unknown as Libp2pNode;

    let requiredDifficultySeen = 0;
    let capturedContext: SyncPowBackpressureContext | undefined;
    await handleSyncSessionChannelsWithPowBackpressure(
      node,
      async (protocol, _connection, context) => {
        await protocol.receiveRangeProofs();
        requiredDifficultySeen = context.getRequiredPowDifficulty();
        capturedContext = context;
      },
      { session: createSession() },
    );

    const peerChannel = new Libp2pSessionChannel(initiatorStream as any, { session: createSession() });
    const peerProtocol = new SyncRangeProofProtocol(peerChannel);
    const handlePromise = registeredHandler?.({
      stream: responderStream as any,
      connection: {} as Connection,
    });

    await peerProtocol.sendPowChallenge({
      minDifficulty: 17,
      ttlSeconds: 60,
      reason: "high queue depth",
    });
    await peerProtocol.sendRangeProofs([
      {
        range: { start: 0x00, end: 0xff },
        merkleRoot: new Uint8Array([9]),
      },
    ]);
    await handlePromise;

    expect(requiredDifficultySeen).toBe(17);
    expect(capturedContext?.getActivePowChallenge()?.minDifficulty).toBe(17);

    await peerChannel.close();
  });

  it("notifies about active challenge when updated", async () => {
    const [initiatorStream, responderStream] = createStreamPair();

    let registeredHandler:
      | ((data: { stream: any; connection: Connection }) => Promise<void>)
      | undefined;
    let updates: (number | undefined)[] = [];
    const node = {
      handle: async (_protocol: string, handler: any) => {
        registeredHandler = handler;
      },
    } as unknown as Libp2pNode;

    const runPromise = handleSyncSessionChannelsWithPowBackpressure(
      node,
      async (protocol, _connection) => {
        await protocol.receiveRangeProofs();
      },
      {
        session: createSession(),
        onPowChallengeUpdate: (challenge) => {
          updates.push(challenge?.minDifficulty);
        },
      },
    );

    const peerChannel = new Libp2pSessionChannel(initiatorStream as any, { session: createSession() });
    const peerProtocol = new SyncRangeProofProtocol(peerChannel);
    const handlePromise = registeredHandler?.({
      stream: responderStream as any,
      connection: {} as Connection,
    });

    await peerProtocol.sendPowChallenge({
      minDifficulty: 19,
      ttlSeconds: 10,
      reason: "pressure",
    });
    await peerProtocol.sendRangeProofs([
      {
        range: { start: 0x00, end: 0xff },
        merkleRoot: new Uint8Array([1]),
      },
    ]);
    await handlePromise;

    await peerChannel.close();
    await runPromise;
    expect(updates).toEqual([19]);
  });

});
