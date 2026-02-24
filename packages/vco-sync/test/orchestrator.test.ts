import { describe, expect, it } from "vitest";
import {
  MerkleRangeProofBuilder,
  ReconciliationState,
  SyncExchangeOrchestrator,
  SyncRangeProofProtocol,
  type HashRange,
  type RangeProof,
  type SyncMessageChannel,
} from "../src/index.js";

class QueueChannel implements SyncMessageChannel {
  private readonly queue: Uint8Array[] = [];
  private readonly waiters: Array<(value: Uint8Array) => void> = [];

  enqueue(payload: Uint8Array): void {
    const next = this.waiters.shift();
    if (next) {
      next(payload);
      return;
    }

    this.queue.push(payload);
  }

  async send(_payload: Uint8Array): Promise<void> {
    throw new Error("QueueChannel.send is not used in this test helper.");
  }

  async receive(): Promise<Uint8Array> {
    const queued = this.queue.shift();
    if (queued) {
      return queued;
    }

    return new Promise<Uint8Array>((resolve) => {
      this.waiters.push(resolve);
    });
  }
}

function linkedChannels(): [SyncMessageChannel, SyncMessageChannel] {
  const leftQueue = new QueueChannel();
  const rightQueue = new QueueChannel();

  const left: SyncMessageChannel = {
    send: async (payload) => {
      rightQueue.enqueue(payload);
    },
    receive: async () => leftQueue.receive(),
  };

  const right: SyncMessageChannel = {
    send: async (payload) => {
      leftQueue.enqueue(payload);
    },
    receive: async () => rightQueue.receive(),
  };

  return [left, right];
}

function rangeKey(range: HashRange): string {
  return `${range.start}-${range.end}`;
}

function asProof(range: HashRange, rootByte: number): RangeProof {
  return {
    range,
    merkleRoot: new Uint8Array([rootByte]),
  };
}

async function serveRounds(
  protocol: SyncRangeProofProtocol,
  rounds: number,
  proofBuilder: (range: HashRange, round: number) => RangeProof,
): Promise<void> {
  for (let round = 1; round <= rounds; round += 1) {
    const requested = await protocol.receiveRangeProofs();
    const response = requested.map((proof) => proofBuilder(proof.range, round));
    await protocol.sendRangeProofs(response);
  }
}

describe("SyncExchangeOrchestrator", () => {
  it("terminates on first round when roots match", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const localProtocol = new SyncRangeProofProtocol(leftChannel);
    const remoteProtocol = new SyncRangeProofProtocol(rightChannel);

    const server = serveRounds(remoteProtocol, 1, (range) => asProof(range, 1));
    const orchestrator = new SyncExchangeOrchestrator(localProtocol, {
      maxRounds: 3,
      rangeProofBuilder: async (range) => asProof(range, 1),
    });

    const outcome = await orchestrator.run();
    await server;

    expect(outcome.state).toBe(ReconciliationState.TERMINATED);
    expect(outcome.rounds).toBe(1);
    expect(outcome.history).toHaveLength(1);
  });

  it("re-enters recurse across multiple rounds when mismatches persist", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const localProtocol = new SyncRangeProofProtocol(leftChannel);
    const remoteProtocol = new SyncRangeProofProtocol(rightChannel);

    const localRoots = new Map<string, number>([
      ["0-255", 1],
      ["0-127", 2],
      ["128-255", 3],
      ["128-191", 4],
      ["192-255", 5],
    ]);
    const remoteRoots = new Map<string, number>([
      ["0-255", 9],
      ["0-127", 2],
      ["128-255", 8],
      ["128-191", 4],
      ["192-255", 7],
    ]);

    const localItems = [
      new Uint8Array(32).fill(0x11),
      new Uint8Array(32).fill(0x22),
      new Uint8Array(32).fill(0x33),
    ];
    localItems[0][0] = 0x00;
    localItems[1][0] = 0x80;
    localItems[2][0] = 0x90;
    const localProofBuilder = new MerkleRangeProofBuilder({
      listHeaderHashes: () => localItems,
    });

    const localBuilder = async (range: HashRange): Promise<RangeProof> => {
      if (range.start === 0x00 && range.end === 0xff) {
        return localProofBuilder.build(range);
      }

      const byte = localRoots.get(rangeKey(range)) ?? 0;
      return asProof(range, byte);
    };
    const remoteBuilder = (range: HashRange): RangeProof => {
      const byte = remoteRoots.get(rangeKey(range)) ?? 0;
      return asProof(range, byte);
    };

    const server = serveRounds(remoteProtocol, 3, remoteBuilder);
    const orchestrator = new SyncExchangeOrchestrator(localProtocol, {
      maxRounds: 3,
      rangeProofBuilder: localBuilder,
    });

    const outcome = await orchestrator.run();
    await server;

    expect(outcome.state).toBe(ReconciliationState.RECURSE);
    expect(outcome.rounds).toBe(3);
    expect(outcome.history).toHaveLength(3);
    expect(outcome.history[1].localProofs).toHaveLength(2);
    expect(outcome.history[2].localProofs).toHaveLength(2);
  });

  it("automatically issues PowChallenge via powChallengeProvider", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const localProtocol = new SyncRangeProofProtocol(leftChannel);
    const receivedChallenges: Array<{ minDifficulty: number; ttlSeconds: number; reason?: string }> = [];
    const remoteProtocol = new SyncRangeProofProtocol(rightChannel, {
      onPowChallenge: (challenge) => {
        receivedChallenges.push(challenge);
      },
    });

    const server = serveRounds(remoteProtocol, 1, (range) => asProof(range, 2));
    const orchestrator = new SyncExchangeOrchestrator(localProtocol, {
      maxRounds: 1,
      rangeProofBuilder: async (range) => asProof(range, 2),
      powChallengeProvider: (round) => ({
        minDifficulty: 21,
        ttlSeconds: 120,
        reason: `round-${round}`,
      }),
    });

    const outcome = await orchestrator.run();
    await server;

    expect(outcome.state).toBe(ReconciliationState.TERMINATED);
    expect(receivedChallenges).toEqual([
      {
        minDifficulty: 21,
        ttlSeconds: 120,
        reason: "round-1",
      },
    ]);
  });
});
