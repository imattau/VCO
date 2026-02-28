import { Follow } from "../generated/social/follow.pb.js";
export const FOLLOW_SCHEMA_URI = "vco://schemas/social/follow/v1";
export interface FollowData { schema: string; subjectKey: Uint8Array; action: "follow" | "unfollow"; timestampMs: bigint; }
export function encodeFollow(d: FollowData): Uint8Array {
  return Follow.encode(Follow.create({ schema: d.schema, subjectKey: d.subjectKey, action: d.action, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeFollow(bytes: Uint8Array): FollowData {
  const m = Follow.decode(bytes);
  return { schema: m.schema, subjectKey: new Uint8Array(m.subjectKey), action: m.action as "follow" | "unfollow", timestampMs: BigInt(m.timestampMs as number) };
}
