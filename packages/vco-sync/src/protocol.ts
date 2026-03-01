import type { RangeProof } from "./types.js";
import {
  decodeSyncControlKind,
  decodePowChallenge,
  decodeRangeProofs,
  encodePowChallenge,
  encodeRangeProofs,
  encodeInterestVector,
  decodeInterestVector,
  type PowChallenge,
} from "./wire.js";
import { vco } from "./generated/vco.pb.js";

export interface SyncMessageChannel {
  send(payload: Uint8Array): Promise<void>;
  receive(): Promise<Uint8Array>;
}

export interface SyncRangeProofProtocolOptions {
  onPowChallenge?: (challenge: PowChallenge) => Promise<void> | void;
  onInterestVector?: (vector: vco.v3.IInterestVector) => Promise<void> | void;
}

export class SyncRangeProofProtocol {
  private latestPowChallenge?: PowChallenge;

  constructor(
    private readonly channel: SyncMessageChannel,
    private readonly options: SyncRangeProofProtocolOptions = {},
  ) {}

  async sendRangeProofs(proofs: readonly RangeProof[]): Promise<void> {
    const encoded = encodeRangeProofs(proofs);
    await this.channel.send(encoded);
  }

  async receiveRangeProofs(): Promise<RangeProof[]> {
    while (true) {
      const encoded = await this.channel.receive();
      const kind = decodeSyncControlKind(encoded);
      if (kind === "pow_challenge") {
        const challenge = decodePowChallenge(encoded);
        this.latestPowChallenge = { ...challenge };
        if (this.options.onPowChallenge) {
          await this.options.onPowChallenge({ ...challenge });
        }
        continue;
      }

      if (kind === "interest_vector") {
        const vector = decodeInterestVector(encoded);
        if (this.options.onInterestVector) {
          await this.options.onInterestVector(vector);
        }
        continue;
      }

      return decodeRangeProofs(encoded);
    }
  }

  async sendPowChallenge(challenge: PowChallenge): Promise<void> {
    const encoded = encodePowChallenge(challenge);
    await this.channel.send(encoded);
  }

  async receivePowChallenge(): Promise<PowChallenge> {
    const encoded = await this.channel.receive();
    const challenge = decodePowChallenge(encoded);
    this.latestPowChallenge = { ...challenge };
    if (this.options.onPowChallenge) {
      await this.options.onPowChallenge({ ...challenge });
    }
    return challenge;
  }

  /**
   * Sends an interest vector to the peer, signaling interest in objects
   * matching specific context IDs and priority thresholds.
   *
   * @param targetCids The context IDs the client is interested in.
   * @param priority Minimum priority level desired.
   */
  async sendInterestVector(targetCids: readonly Uint8Array[], priority?: vco.v3.PriorityLevel): Promise<void> {
    const encoded = encodeInterestVector(targetCids, priority);
    await this.channel.send(encoded);
  }

  /**
   * Receives an interest vector from the peer.
   *
   * @returns The decoded interest vector.
   */
  async receiveInterestVector(): Promise<vco.v3.IInterestVector> {
    const encoded = await this.channel.receive();
    return decodeInterestVector(encoded);
  }

  async requestRangeProofs(proofs: readonly RangeProof[]): Promise<RangeProof[]> {
    await this.sendRangeProofs(proofs);
    return this.receiveRangeProofs();
  }

  getLatestPowChallenge(): PowChallenge | undefined {
    if (!this.latestPowChallenge) {
      return undefined;
    }

    return { ...this.latestPowChallenge };
  }
}
