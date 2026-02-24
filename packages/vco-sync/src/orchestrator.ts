import { ReconciliationEngine, type ReconciliationEngineOptions } from "./engine.js";
import { ReconciliationState, type HashRange, type RangeProof } from "./types.js";
import { SyncRangeProofProtocol } from "./protocol.js";
import type { PowChallenge } from "./wire.js";

const DEFAULT_MAX_ROUNDS = 8;

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function defaultSelectNextRange(localProofs: readonly RangeProof[], remoteProofs: readonly RangeProof[]): HashRange | null {
  const count = Math.min(localProofs.length, remoteProofs.length);
  for (let index = 0; index < count; index += 1) {
    if (!bytesEqual(localProofs[index].merkleRoot, remoteProofs[index].merkleRoot)) {
      return remoteProofs[index].range;
    }
  }

  return null;
}

function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
}

function ensureProofs(proofs: readonly RangeProof[], fieldName: string): void {
  if (proofs.length === 0) {
    throw new Error(`${fieldName} must contain at least one range proof.`);
  }
}

export interface RangeProofBuilder {
  (range: HashRange, round: number): Promise<RangeProof> | RangeProof;
}

export interface RangeSelector {
  (localProofs: readonly RangeProof[], remoteProofs: readonly RangeProof[], round: number): HashRange | null;
}

export interface PowChallengeProvider {
  (round: number): Promise<PowChallenge | null | undefined> | PowChallenge | null | undefined;
}

export interface SyncExchangeOptions {
  maxRounds?: number;
  rangeProofBuilder: RangeProofBuilder;
  rangeSelector?: RangeSelector;
  powChallengeProvider?: PowChallengeProvider;
  powChallengeEachRound?: boolean;
  engineOptions?: ReconciliationEngineOptions;
}

export interface SyncExchangeRound {
  round: number;
  localProofs: RangeProof[];
  remoteProofs: RangeProof[];
  state: ReconciliationState;
}

export interface SyncExchangeOutcome {
  state: ReconciliationState;
  rounds: number;
  history: SyncExchangeRound[];
}

export class SyncExchangeOrchestrator {
  private readonly engine: ReconciliationEngine;
  private readonly maxRounds: number;
  private readonly rangeProofBuilder: RangeProofBuilder;
  private readonly rangeSelector: RangeSelector;
  private readonly powChallengeProvider?: PowChallengeProvider;
  private readonly powChallengeEachRound: boolean;

  constructor(
    private readonly protocol: SyncRangeProofProtocol,
    options: SyncExchangeOptions,
  ) {
    this.engine = new ReconciliationEngine(options.engineOptions);
    this.maxRounds = options.maxRounds ?? DEFAULT_MAX_ROUNDS;
    this.rangeProofBuilder = options.rangeProofBuilder;
    this.rangeSelector = options.rangeSelector ?? defaultSelectNextRange;
    this.powChallengeProvider = options.powChallengeProvider;
    this.powChallengeEachRound = options.powChallengeEachRound ?? false;

    assertPositiveInteger(this.maxRounds, "maxRounds");
  }

  async run(): Promise<SyncExchangeOutcome> {
    const history: SyncExchangeRound[] = [];
    let currentRanges: HashRange[] = [this.engine.snapshot().fullRange];

    for (let round = 1; round <= this.maxRounds; round += 1) {
      if (this.powChallengeProvider && (round === 1 || this.powChallengeEachRound)) {
        const challenge = await this.powChallengeProvider(round);
        if (challenge) {
          await this.protocol.sendPowChallenge(challenge);
        }
      }

      const localProofs = await Promise.all(
        currentRanges.map((range) => this.rangeProofBuilder(range, round)),
      );
      ensureProofs(localProofs, "localProofs");

      await this.protocol.sendRangeProofs(localProofs);
      const remoteProofs = await this.protocol.receiveRangeProofs();
      ensureProofs(remoteProofs, "remoteProofs");

      let state: ReconciliationState;
      if (round === 1) {
        state = this.engine.compare(localProofs[0].merkleRoot, remoteProofs[0].merkleRoot);
      } else {
        state = ReconciliationState.RECURSE;
      }

      history.push({
        round,
        localProofs: localProofs.map((proof) => ({
          range: { ...proof.range },
          merkleRoot: Uint8Array.from(proof.merkleRoot),
        })),
        remoteProofs: remoteProofs.map((proof) => ({
          range: { ...proof.range },
          merkleRoot: Uint8Array.from(proof.merkleRoot),
        })),
        state,
      });

      if (state === ReconciliationState.TERMINATED) {
        return { state, rounds: round, history };
      }

      const nextRange = this.rangeSelector(localProofs, remoteProofs, round);
      if (!nextRange) {
        history[history.length - 1].state = ReconciliationState.TERMINATED;
        return { state: ReconciliationState.TERMINATED, rounds: round, history };
      }

      if (nextRange.start === nextRange.end) {
        history[history.length - 1].state = ReconciliationState.EXCHANGE;
        return { state: ReconciliationState.EXCHANGE, rounds: round, history };
      }

      const [left, right] = this.engine.bisect(nextRange);
      history[history.length - 1].state =
        round === 1 ? ReconciliationState.BISECT : ReconciliationState.RECURSE;
      currentRanges = [left, right];
    }

    return {
      state: ReconciliationState.RECURSE,
      rounds: this.maxRounds,
      history,
    };
  }
}
