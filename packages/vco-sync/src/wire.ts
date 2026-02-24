import type { RangeProof } from "./types.js";
import { vco } from "./generated/vco.pb.js";

const MIN_HASH_BOUND = 0x00;
const MAX_HASH_BOUND = 0xff;

export interface SyncWireRange {
  startHash: Uint8Array;
  endHash: Uint8Array;
  fingerprint: Uint8Array;
}

interface ProtoSyncRange {
  startHash: Uint8Array;
  endHash: Uint8Array;
  fingerprint: Uint8Array;
}

interface ProtoSyncMessage {
  ranges: ProtoSyncRange[];
}

interface ProtoPowChallenge {
  minDifficulty: number;
  ttlSeconds: number;
  reason: string;
}

interface ProtoSyncControl {
  syncMessage?: ProtoSyncMessage | null;
  powChallenge?: ProtoPowChallenge | null;
}

export interface PowChallenge {
  minDifficulty: number;
  ttlSeconds: number;
  reason?: string;
}

export type SyncControlKind = "range_proofs" | "pow_challenge";

interface DecodedSyncControl {
  kind: SyncControlKind;
  syncMessage?: vco.v3.ISyncMessage | null;
  powChallenge?: vco.v3.IPowChallenge | null;
}

function toUint8Array(value: Uint8Array | number[] | null | undefined): Uint8Array {
  if (!value) {
    return new Uint8Array();
  }

  return Uint8Array.from(value);
}

function assertUint8Array(value: Uint8Array, fieldName: string): void {
  if (!(value instanceof Uint8Array)) {
    throw new Error(`${fieldName} must be a Uint8Array.`);
  }
}

function assertHashBound(bound: number, fieldName: string): void {
  if (!Number.isInteger(bound) || bound < MIN_HASH_BOUND || bound > MAX_HASH_BOUND) {
    throw new Error(`${fieldName} must be an integer within [0, 255].`);
  }
}

function assertUint32(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) {
    throw new Error(`${fieldName} must be a uint32.`);
  }
}

function assertPowDifficulty(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 256) {
    throw new Error(`${fieldName} must be an integer within [0, 256].`);
  }
}

function assertSyncWireRange(range: SyncWireRange, fieldName: string): void {
  assertUint8Array(range.startHash, `${fieldName}.startHash`);
  assertUint8Array(range.endHash, `${fieldName}.endHash`);
  assertUint8Array(range.fingerprint, `${fieldName}.fingerprint`);
}

function toProtoSyncMessage(ranges: readonly SyncWireRange[]): ProtoSyncMessage {
  return {
    ranges: ranges.map((range, index) => {
      assertSyncWireRange(range, `ranges[${index}]`);
      return {
        startHash: range.startHash,
        endHash: range.endHash,
        fingerprint: range.fingerprint,
      };
    }),
  };
}

function toProtoPowChallenge(challenge: PowChallenge): ProtoPowChallenge {
  assertPowDifficulty(challenge.minDifficulty, "powChallenge.minDifficulty");

  assertUint32(challenge.ttlSeconds, "powChallenge.ttlSeconds");

  return {
    minDifficulty: challenge.minDifficulty,
    ttlSeconds: challenge.ttlSeconds,
    reason: challenge.reason ?? "",
  };
}

function encodeSyncControl(control: ProtoSyncControl): Uint8Array {
  const validationError = vco.v3.SyncControl.verify(
    control as unknown as Record<string, unknown>,
  );
  if (validationError) {
    throw new Error(`SyncControl protobuf validation failed: ${validationError}`);
  }

  return vco.v3.SyncControl.encode(vco.v3.SyncControl.create(control)).finish();
}

function decodeSyncControl(encoded: Uint8Array): DecodedSyncControl {
  assertUint8Array(encoded, "encoded");

  const control = vco.v3.SyncControl.decode(encoded);
  const hasSyncMessage = control.syncMessage != null;
  const hasPowChallenge = control.powChallenge != null;

  if (hasSyncMessage === hasPowChallenge) {
    throw new Error("SyncControl must contain exactly one message type.");
  }

  if (hasSyncMessage) {
    return {
      kind: "range_proofs",
      syncMessage: control.syncMessage,
    };
  }

  return {
    kind: "pow_challenge",
    powChallenge: control.powChallenge,
  };
}

export function decodeSyncControlKind(encoded: Uint8Array): SyncControlKind {
  return decodeSyncControl(encoded).kind;
}

export function encodeSyncWireMessage(ranges: readonly SyncWireRange[]): Uint8Array {
  const message = toProtoSyncMessage(ranges);
  return encodeSyncControl({
    syncMessage: message,
  });
}

export function decodeSyncWireMessage(encoded: Uint8Array): SyncWireRange[] {
  const control = decodeSyncControl(encoded);
  if (control.kind !== "range_proofs" || !control.syncMessage) {
    throw new Error("Expected SyncControl.sync_message payload.");
  }

  return (control.syncMessage.ranges ?? []).map((range) => ({
    startHash: toUint8Array(range.startHash),
    endHash: toUint8Array(range.endHash),
    fingerprint: toUint8Array(range.fingerprint),
  }));
}

export function encodePowChallenge(challenge: PowChallenge): Uint8Array {
  const protoChallenge = toProtoPowChallenge(challenge);
  return encodeSyncControl({
    powChallenge: protoChallenge,
  });
}

export function decodePowChallenge(encoded: Uint8Array): PowChallenge {
  const control = decodeSyncControl(encoded);
  if (control.kind !== "pow_challenge" || !control.powChallenge) {
    throw new Error("Expected SyncControl.pow_challenge payload.");
  }

  const decoded = control.powChallenge;
  const minDifficulty = decoded.minDifficulty ?? 0;
  const ttlSeconds = decoded.ttlSeconds ?? 0;
  assertPowDifficulty(minDifficulty, "powChallenge.minDifficulty");
  assertUint32(ttlSeconds, "powChallenge.ttlSeconds");

  return {
    minDifficulty,
    ttlSeconds,
    reason: decoded.reason ?? "",
  };
}

export function encodeHashBound(bound: number): Uint8Array {
  assertHashBound(bound, "bound");
  return Uint8Array.from([bound]);
}

export function decodeHashBound(encoded: Uint8Array, fieldName = "bound"): number {
  assertUint8Array(encoded, fieldName);

  if (encoded.length !== 1) {
    throw new Error(`${fieldName} must be exactly 1 byte for the current reconciliation engine.`);
  }

  const bound = encoded[0];
  assertHashBound(bound, fieldName);
  return bound;
}

export function encodeRangeProofs(proofs: readonly RangeProof[]): Uint8Array {
  const ranges: SyncWireRange[] = proofs.map((proof, index) => {
    assertHashBound(proof.range.start, `proofs[${index}].range.start`);
    assertHashBound(proof.range.end, `proofs[${index}].range.end`);

    if (proof.range.start > proof.range.end) {
      throw new Error(`proofs[${index}].range.start must be <= range.end.`);
    }

    assertUint8Array(proof.merkleRoot, `proofs[${index}].merkleRoot`);

    return {
      startHash: encodeHashBound(proof.range.start),
      endHash: encodeHashBound(proof.range.end),
      fingerprint: proof.merkleRoot,
    };
  });

  return encodeSyncWireMessage(ranges);
}

export function decodeRangeProofs(encoded: Uint8Array): RangeProof[] {
  const ranges = decodeSyncWireMessage(encoded);

  return ranges.map((range, index) => {
    const start = decodeHashBound(range.startHash, `ranges[${index}].startHash`);
    const end = decodeHashBound(range.endHash, `ranges[${index}].endHash`);

    if (start > end) {
      throw new Error(`ranges[${index}].startHash must be <= endHash.`);
    }

    return {
      range: { start, end },
      merkleRoot: range.fingerprint,
    };
  });
}
