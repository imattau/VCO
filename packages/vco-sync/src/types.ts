/**
 * Represesnts a range of hashes for set reconciliation.
 */
export interface HashRange {
  /** The start of the range (e.g. timestamp or hash prefix). */
  start: number;
  /** The end of the range. */
  end: number;
}

/**
 * Proof of a set of items within a hash range.
 */
export interface RangeProof {
  /** The range being proved. */
  range: HashRange;
  /** The Merkle root of the items in this range. */
  merkleRoot: Uint8Array;
}

/**
 * A single item for set reconciliation.
 */
export interface ReconciliationItem {
  /** Timestamp of the item (used for range partitioning). */
  timestamp: number;
  /** The unique identifier (header hash) of the item. */
  id: Uint8Array;
}

/**
 * State machine steps for the set reconciliation protocol.
 */
export enum ReconciliationState {
  /** Initial state. */
  INIT = "INIT",
  /** Comparing range proofs. */
  COMPARE = "COMPARE",
  /** Bisecting range for fine-grained comparison. */
  BISECT = "BISECT",
  /** Recursing into sub-ranges. */
  RECURSE = "RECURSE",
  /** Exchanging missing items. */
  EXCHANGE = "EXCHANGE",
  /** Reconciliation completed. */
  TERMINATED = "TERMINATED",
}

/**
 * The final result of a reconciliation session.
 */
export interface ReconciliationResult {
  /** The final state of the session. */
  state: ReconciliationState;
  /** Set of IDs that were needed from the remote but not available locally. */
  need: Set<string>;
  /** Set of IDs that were available locally but not on the remote. */
  have: Set<string>;
  /** Number of rounds performed. */
  rounds: number;
}

/**
 * Snapshot of the current state of a reconciliation engine.
 */
export interface ReconciliationSnapshot {
  /** Current state machine step. */
  state: ReconciliationState;
  /** The full range being reconciled. */
  fullRange: HashRange;
  /** Threshold for switching from proof comparison to item exchange. */
  reconThreshold: number;
  /** Maximum frame size for transport. */
  frameSizeLimit: number;
}
