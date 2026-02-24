export interface HashRange {
  start: number;
  end: number;
}

export interface RangeProof {
  range: HashRange;
  merkleRoot: Uint8Array;
}

export interface ReconciliationItem {
  timestamp: number;
  id: Uint8Array;
}

export enum ReconciliationState {
  INIT = "INIT",
  COMPARE = "COMPARE",
  BISECT = "BISECT",
  RECURSE = "RECURSE",
  EXCHANGE = "EXCHANGE",
  TERMINATED = "TERMINATED",
}

export interface ReconciliationResult {
  state: ReconciliationState;
  need: Set<string>;
  have: Set<string>;
  rounds: number;
}

export interface ReconciliationSnapshot {
  state: ReconciliationState;
  fullRange: HashRange;
  reconThreshold: number;
  frameSizeLimit: number;
}
