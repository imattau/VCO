import type { PowChallenge } from "./wire.js";

const DEFAULT_TTL_SECONDS = 60;

function assertDifficulty(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 256) {
    throw new Error(`${fieldName} must be an integer within [0, 256].`);
  }
}

function assertUint32(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) {
    throw new Error(`${fieldName} must be a uint32.`);
  }
}

export interface PowChallengePolicyOptions {
  now?: () => number;
  defaultTtlSeconds?: number;
  minDifficultyProvider?: () => number;
  reasonProvider?: () => string | undefined;
}

interface ActiveChallenge {
  challenge: PowChallenge;
  expiresAtMs: number;
}

export class PowChallengePolicy {
  private readonly now: () => number;
  private readonly defaultTtlSeconds: number;
  private readonly minDifficultyProvider: () => number;
  private readonly reasonProvider: () => string | undefined;
  private activeChallenge?: ActiveChallenge;

  constructor(options: PowChallengePolicyOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.defaultTtlSeconds = options.defaultTtlSeconds ?? DEFAULT_TTL_SECONDS;
    assertUint32(this.defaultTtlSeconds, "defaultTtlSeconds");
    this.minDifficultyProvider = options.minDifficultyProvider ?? (() => 0);
    this.reasonProvider = options.reasonProvider ?? (() => undefined);
  }

  createOutboundChallenge(): PowChallenge | undefined {
    const minDifficulty = this.minDifficultyProvider();
    assertDifficulty(minDifficulty, "minDifficultyProvider()");
    if (minDifficulty === 0) {
      return undefined;
    }

    return {
      minDifficulty,
      ttlSeconds: this.defaultTtlSeconds,
      reason: this.reasonProvider(),
    };
  }

  applyInboundChallenge(challenge: PowChallenge): void {
    assertDifficulty(challenge.minDifficulty, "challenge.minDifficulty");
    assertUint32(challenge.ttlSeconds, "challenge.ttlSeconds");

    if (challenge.minDifficulty === 0 || challenge.ttlSeconds === 0) {
      this.activeChallenge = undefined;
      return;
    }

    this.activeChallenge = {
      challenge: { ...challenge },
      expiresAtMs: this.now() + challenge.ttlSeconds * 1_000,
    };
  }

  getRequiredDifficulty(): number {
    this.cleanupExpired();
    return this.activeChallenge?.challenge.minDifficulty ?? 0;
  }

  getActiveChallenge(): PowChallenge | undefined {
    this.cleanupExpired();
    if (!this.activeChallenge) {
      return undefined;
    }

    return { ...this.activeChallenge.challenge };
  }

  private cleanupExpired(): void {
    if (!this.activeChallenge) {
      return;
    }

    if (this.now() >= this.activeChallenge.expiresAtMs) {
      this.activeChallenge = undefined;
    }
  }
}
