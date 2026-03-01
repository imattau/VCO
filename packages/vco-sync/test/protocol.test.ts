import { describe, expect, it } from "vitest";
import {
  SyncRangeProofProtocol,
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

describe("SyncRangeProofProtocol", () => {
  it("sends and receives range proofs over a generic byte channel", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const left = new SyncRangeProofProtocol(leftChannel);
    const right = new SyncRangeProofProtocol(rightChannel);

    const sendFromLeft = left.sendRangeProofs([
      {
        range: { start: 0x00, end: 0x7f },
        merkleRoot: new Uint8Array([1, 2, 3]),
      },
    ]);

    const receivedByRight = await right.receiveRangeProofs();
    await sendFromLeft;

    expect(receivedByRight).toEqual([
      {
        range: { start: 0x00, end: 0x7f },
        merkleRoot: new Uint8Array([1, 2, 3]),
      },
    ]);
  });

  it("fails decode when the channel yields invalid range bounds", async () => {
    const invalidPayload = new TextEncoder().encode("{\"ranges\":[{\"startHash\":\"oops\"}]}");
    const protocol = new SyncRangeProofProtocol({
      send: async () => {},
      receive: async () => invalidPayload,
    });

    await expect(async () => protocol.receiveRangeProofs()).rejects.toThrow();
  });

  it("auto-handles PowChallenge messages before receiving range proofs", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const seenChallenges: Array<{ minDifficulty: number; ttlSeconds: number; reason?: string }> = [];
    const left = new SyncRangeProofProtocol(leftChannel);
    const right = new SyncRangeProofProtocol(rightChannel, {
      onPowChallenge: (challenge) => {
        seenChallenges.push(challenge);
      },
    });

    await left.sendPowChallenge({
      minDifficulty: 18,
      ttlSeconds: 45,
      reason: "high load",
    });
    await left.sendRangeProofs([
      {
        range: { start: 0x00, end: 0xff },
        merkleRoot: new Uint8Array([5, 4, 3]),
      },
    ]);

    const receivedByRight = await right.receiveRangeProofs();

    expect(receivedByRight).toEqual([
      {
        range: { start: 0x00, end: 0xff },
        merkleRoot: new Uint8Array([5, 4, 3]),
      },
    ]);
    expect(seenChallenges).toEqual([
      {
        minDifficulty: 18,
        ttlSeconds: 45,
        reason: "high load",
      },
    ]);
    expect(right.getLatestPowChallenge()).toEqual({
      minDifficulty: 18,
      ttlSeconds: 45,
      reason: "high load",
    });
  });

  it("sends and receives PowChallenge control messages", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const left = new SyncRangeProofProtocol(leftChannel);
    const right = new SyncRangeProofProtocol(rightChannel);

    const sendFromLeft = left.sendPowChallenge({
      minDifficulty: 22,
      ttlSeconds: 90,
      reason: "queue saturation",
    });

    const receivedByRight = await right.receivePowChallenge();
    await sendFromLeft;

    expect(receivedByRight).toEqual({
      minDifficulty: 22,
      ttlSeconds: 90,
      reason: "queue saturation",
    });
  });

  it("sends and receives InterestVector control messages", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const left = new SyncRangeProofProtocol(leftChannel);
    const right = new SyncRangeProofProtocol(rightChannel);

    const targetCids = [new Uint8Array([1, 1, 1]), new Uint8Array([2, 2, 2])];
    const sendFromLeft = left.sendInterestVector(targetCids);

    const receivedByRight = await right.receiveInterestVector();
    await sendFromLeft;

    expect(receivedByRight.targetCids).toEqual(targetCids);
  });

  it("auto-handles InterestVector messages before receiving range proofs", async () => {
    const [leftChannel, rightChannel] = linkedChannels();
    const seenVectors: any[] = [];
    const left = new SyncRangeProofProtocol(leftChannel);
    const right = new SyncRangeProofProtocol(rightChannel, {
      onInterestVector: (vector) => {
        seenVectors.push(vector);
      },
    });

    const targetCids = [new Uint8Array([0xaa]), new Uint8Array([0xbb])];
    await left.sendInterestVector(targetCids);
    await left.sendRangeProofs([
      {
        range: { start: 0x00, end: 0xff },
        merkleRoot: new Uint8Array([1]),
      },
    ]);

    const receivedByRight = await right.receiveRangeProofs();

    expect(receivedByRight.length).toBe(1);
    expect(seenVectors.length).toBe(1);
    expect(seenVectors[0].targetCids).toEqual(targetCids);
  });
});
