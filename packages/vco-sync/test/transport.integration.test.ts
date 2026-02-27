import { describe, expect, it } from "vitest";
import {
  Libp2pSessionChannel,
  TransportSession,
  ZeroRandomSource,
} from "../../vco-transport/src/index.ts";
import {
  PowChallengePolicy,
  ReconciliationState,
  SyncExchangeOrchestrator,
  SyncRangeProofProtocol,
  type HashRange,
  type RangeProof,
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

function makeProof(range: HashRange, byte: number): RangeProof {
  return {
    range,
    merkleRoot: new Uint8Array([byte]),
  };
}

describe("sync + transport integration", () => {
  it("runs sync exchange over Libp2pSessionChannel", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const leftChannel = new Libp2pSessionChannel(leftStream as any, { session: createSession() });
    const rightChannel = new Libp2pSessionChannel(rightStream as any, { session: createSession() });
    const localProtocol = new SyncRangeProofProtocol(leftChannel);
    const remoteProtocol = new SyncRangeProofProtocol(rightChannel);

    const server = (async () => {
      const incoming = await remoteProtocol.receiveRangeProofs();
      const response = incoming.map((proof) => makeProof(proof.range, 7));
      await remoteProtocol.sendRangeProofs(response);
    })();

    const orchestrator = new SyncExchangeOrchestrator(localProtocol, {
      maxRounds: 2,
      rangeProofBuilder: async (range) => makeProof(range, 7),
    });
    const outcome = await orchestrator.run();
    await server;

    expect(outcome.state).toBe(ReconciliationState.TERMINATED);
    expect(outcome.rounds).toBe(1);

    await leftChannel.close();
    await rightChannel.close();
  });

  it("applies remote PowChallenge policy over a live session channel", async () => {
    const [leftStream, rightStream] = createStreamPair();
    const leftChannel = new Libp2pSessionChannel(leftStream as any, { session: createSession() });
    const rightChannel = new Libp2pSessionChannel(rightStream as any, { session: createSession() });
    const policy = new PowChallengePolicy();
    const localProtocol = new SyncRangeProofProtocol(leftChannel, {
      onPowChallenge: (challenge) => {
        policy.applyInboundChallenge(challenge);
      },
    });
    const remoteProtocol = new SyncRangeProofProtocol(rightChannel);

    const server = (async () => {
      await remoteProtocol.sendPowChallenge({
        minDifficulty: 20,
        ttlSeconds: 120,
        reason: "queue pressure",
      });
      const incoming = await remoteProtocol.receiveRangeProofs();
      const response = incoming.map((proof) => makeProof(proof.range, 9));
      await remoteProtocol.sendRangeProofs(response);
    })();

    const orchestrator = new SyncExchangeOrchestrator(localProtocol, {
      maxRounds: 1,
      rangeProofBuilder: async (range) => makeProof(range, 9),
    });
    const outcome = await orchestrator.run();
    await server;

    expect(outcome.state).toBe(ReconciliationState.TERMINATED);
    expect(policy.getRequiredDifficulty()).toBe(20);

    await leftChannel.close();
    await rightChannel.close();
  });
});
