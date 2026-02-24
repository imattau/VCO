import type { RangeProof } from "./types.js";
import {
  decodeSyncControlKind,
  decodePowChallenge,
  decodeRangeProofs,
  encodePowChallenge,
  encodeRangeProofs,
  type PowChallenge,
} from "./wire.js";

export interface SyncMessageChannel {
  send(payload: Uint8Array): Promise<void>;
  receive(): Promise<Uint8Array>;
}

export interface SyncRangeProofProtocolOptions {
  onPowChallenge?: (challenge: PowChallenge) => Promise<void> | void;
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
