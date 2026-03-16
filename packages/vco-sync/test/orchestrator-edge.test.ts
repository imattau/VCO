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
    if (next) { next(payload); return; }
    this.queue.push(payload);
  }

  async send(payload: Uint8Array): Promise<void> {
    this.enqueue(payload);
  }

  async receive(): Promise<Uint8Array> {
    const queued = this.queue.shift();
    if (queued) return queued;
    return new Promise<Uint8Array>((resolve) => { this.waiters.push(resolve); });
  }
}

function linkedChannels(): [SyncMessageChannel, SyncMessageChannel] {
  const leftQueue = new QueueChannel();
  const rightQueue = new QueueChannel();
  const left: SyncMessageChannel = {
    send: async (payload) => { rightQueue.enqueue(payload); },
    receive: async () => leftQueue.receive(),
  };
  const right: SyncMessageChannel = {
    send: async (payload) => { leftQueue.enqueue(payload); },
    receive: async () => rightQueue.receive(),
  };
  return [left, right];
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

describe("SyncExchangeOrchestrator edge cases", () => {
  it("throws immediately when maxRounds is 0", () => {
    const [channel] = linkedChannels();
    const protocol = new SyncRangeProofProtocol(channel);
    expect(() => new SyncExchangeOrchestrator(protocol, { 
      maxRounds: 0,
      rangeProofBuilder: async (range) => asProof(range, 0)
    })).toThrow();
  });

  it("throws immediately when maxRounds is negative", () => {
    const [channel] = linkedChannels();
    const protocol = new SyncRangeProofProtocol(channel);
    expect(() => new SyncExchangeOrchestrator(protocol, { 
      maxRounds: -1,
      rangeProofBuilder: async (range) => asProof(range, 0)
    })).toThrow();
  });

  it("terminates after maxRounds=1 with a single exchange round", async () => {
    const [clientChannel, relayChannel] = linkedChannels();
    const clientProtocol = new SyncRangeProofProtocol(clientChannel);
    const relayProtocol = new SyncRangeProofProtocol(relayChannel);

    const clientOrchestrator = new SyncExchangeOrchestrator(clientProtocol, {
      maxRounds: 1,
      rangeProofBuilder: async (range) => asProof(range, 1),
    });

    const server = serveRounds(relayProtocol, 1, (range) => asProof(range, 2));
    
    const outcome = await clientOrchestrator.run();
    await server;

    expect(outcome.state).toBe(ReconciliationState.RECURSE); // Because maxRounds=1 and they didn't match
    expect(outcome.rounds).toBe(1);
  });

  it("terminates cleanly when rangeSelector returns null", async () => {
    const [clientChannel, relayChannel] = linkedChannels();
    const clientProtocol = new SyncRangeProofProtocol(clientChannel);
    const relayProtocol = new SyncRangeProofProtocol(relayChannel);

    // rangeSelector that always returns null — forces immediate termination
    const nullRangeSelector = (): HashRange | null => null;

    const clientOrchestrator = new SyncExchangeOrchestrator(clientProtocol, {
      maxRounds: 10,
      rangeProofBuilder: async (range) => asProof(range, 1),
      rangeSelector: nullRangeSelector,
    });

    const server = serveRounds(relayProtocol, 1, (range) => asProof(range, 2));

    const outcome = await clientOrchestrator.run();
    await server;

    expect(outcome.state).toBe(ReconciliationState.TERMINATED);
  });
});
