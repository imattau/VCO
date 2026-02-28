import { Tombstone } from "../generated/social/tombstone.pb.js";
export const TOMBSTONE_SCHEMA_URI = "vco://schemas/social/tombstone/v1";
export interface TombstoneData { schema: string; targetCid: Uint8Array; reason: string; timestampMs: bigint; }
export function encodeTombstone(d: TombstoneData): Uint8Array {
  return Tombstone.encode(Tombstone.create({ schema: d.schema, targetCid: d.targetCid, reason: d.reason, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeTombstone(bytes: Uint8Array): TombstoneData {
  const m = Tombstone.decode(bytes);
  return { schema: m.schema, targetCid: new Uint8Array(m.targetCid), reason: m.reason, timestampMs: BigInt(m.timestampMs as number) };
}
