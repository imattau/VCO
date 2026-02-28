import { Vote } from "../generated/coordination/vote.pb.js";
export const VOTE_SCHEMA_URI = "vco://schemas/coordination/vote/v1";
export interface VoteData { schema: string; pollCid: Uint8Array; optionIndex: number; timestampMs: bigint; }
export function encodeVote(d: VoteData): Uint8Array {
  return Vote.encode(Vote.create({ schema: d.schema, pollCid: d.pollCid, optionIndex: d.optionIndex, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeVote(bytes: Uint8Array): VoteData {
  const m = Vote.decode(bytes);
  return { schema: m.schema, pollCid: new Uint8Array(m.pollCid), optionIndex: m.optionIndex, timestampMs: BigInt(m.timestampMs as number) };
}
