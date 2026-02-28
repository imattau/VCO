import { Reaction } from "../generated/social/reaction.pb.js";
export const REACTION_SCHEMA_URI = "vco://schemas/social/reaction/v1";
export interface ReactionData { schema: string; targetCid: Uint8Array; emoji: string; timestampMs: bigint; }
export function encodeReaction(d: ReactionData): Uint8Array {
  return Reaction.encode(Reaction.create({ schema: d.schema, targetCid: d.targetCid, emoji: d.emoji, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeReaction(bytes: Uint8Array): ReactionData {
  const m = Reaction.decode(bytes);
  return { schema: m.schema, targetCid: new Uint8Array(m.targetCid), emoji: m.emoji, timestampMs: BigInt(m.timestampMs as number) };
}
