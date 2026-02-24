import { HASH_RANGE_END, HASH_RANGE_START, RECON_THRESHOLD } from "./constants.js";
import { reconcileWithNegentropy } from "./negentropy-adapter.js";
import {
  ReconciliationState,
  type HashRange,
  type ReconciliationItem,
  type RangeProof,
  type ReconciliationResult,
  type ReconciliationSnapshot,
} from "./types.js";

const FULL_HASH_RANGE: HashRange = { start: HASH_RANGE_START, end: HASH_RANGE_END };
const MIN_HASH_BOUND = HASH_RANGE_START;
const MAX_HASH_BOUND = HASH_RANGE_END;
const MIN_RECON_THRESHOLD = 1;
const MIN_FRAME_SIZE_LIMIT = 4_096;
const DEFAULT_FRAME_SIZE_LIMIT = 50_000;

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

function validateRange(range: HashRange, fieldName: string): void {
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end)) {
    throw new Error(`${fieldName} bounds must be integers.`);
  }

  if (range.start < MIN_HASH_BOUND || range.end > MAX_HASH_BOUND) {
    throw new Error(`${fieldName} bounds must be within [0, 255].`);
  }

  if (range.start > range.end) {
    throw new Error(`${fieldName} start must be <= end.`);
  }
}

function validateRoot(root: Uint8Array, fieldName: string): void {
  if (root.length === 0) {
    throw new Error(`${fieldName} must not be empty.`);
  }
}

function isUnitRange(range: HashRange): boolean {
  return range.start === range.end;
}

function splitRange(range: HashRange): [HashRange, HashRange] {
  validateRange(range, "range");
  if (isUnitRange(range)) {
    throw new Error("Cannot bisect a unit range.");
  }

  const midpoint = Math.floor((range.start + range.end) / 2);
  return [
    { start: range.start, end: midpoint },
    { start: midpoint + 1, end: range.end },
  ];
}

export interface ReconciliationEngineOptions {
  fullRange?: HashRange;
  reconThreshold?: number;
  frameSizeLimit?: number;
}

export class ReconciliationEngine {
  private state: ReconciliationState = ReconciliationState.INIT;
  private readonly fullRange: HashRange;
  private readonly reconThreshold: number;
  private readonly frameSizeLimit: number;

  constructor(options: ReconciliationEngineOptions = {}) {
    const fullRange = options.fullRange ?? FULL_HASH_RANGE;
    const reconThreshold = options.reconThreshold ?? RECON_THRESHOLD;
    const frameSizeLimit = options.frameSizeLimit ?? DEFAULT_FRAME_SIZE_LIMIT;

    validateRange(fullRange, "fullRange");
    if (!Number.isInteger(reconThreshold) || reconThreshold < MIN_RECON_THRESHOLD) {
      throw new Error("reconThreshold must be a positive integer.");
    }

    if (!Number.isInteger(frameSizeLimit) || frameSizeLimit < MIN_FRAME_SIZE_LIMIT) {
      throw new Error(`frameSizeLimit must be an integer >= ${MIN_FRAME_SIZE_LIMIT}.`);
    }

    this.fullRange = { start: fullRange.start, end: fullRange.end };
    this.reconThreshold = reconThreshold;
    this.frameSizeLimit = frameSizeLimit;
  }

  begin(localRoot: Uint8Array): RangeProof {
    validateRoot(localRoot, "localRoot");
    this.state = ReconciliationState.COMPARE;
    return {
      range: { ...this.fullRange },
      merkleRoot: localRoot,
    };
  }

  compare(localRoot: Uint8Array, remoteRoot: Uint8Array): ReconciliationState {
    validateRoot(localRoot, "localRoot");
    validateRoot(remoteRoot, "remoteRoot");

    this.state = bytesEqual(localRoot, remoteRoot)
      ? ReconciliationState.TERMINATED
      : ReconciliationState.BISECT;
    return this.state;
  }

  bisect(range: HashRange): [HashRange, HashRange] {
    const [left, right] = splitRange(range);
    this.state = ReconciliationState.BISECT;
    return [left, right];
  }

  async reconcile(
    localItems: readonly ReconciliationItem[],
    remoteItems: readonly ReconciliationItem[],
  ): Promise<ReconciliationResult> {
    const delta = await reconcileWithNegentropy(localItems, remoteItems, this.frameSizeLimit);
    const maxDelta = Math.max(delta.need.size, delta.have.size);

    if (maxDelta === 0) {
      this.state = ReconciliationState.TERMINATED;
    } else if (maxDelta <= this.reconThreshold) {
      this.state = ReconciliationState.EXCHANGE;
    } else {
      this.state = ReconciliationState.RECURSE;
    }

    return {
      state: this.state,
      need: delta.need,
      have: delta.have,
      rounds: delta.rounds,
    };
  }

  snapshot(): ReconciliationSnapshot {
    return {
      state: this.state,
      fullRange: { ...this.fullRange },
      reconThreshold: this.reconThreshold,
      frameSizeLimit: this.frameSizeLimit,
    };
  }
}
