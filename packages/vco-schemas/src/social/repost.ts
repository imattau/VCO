import { Repost } from "../generated/social/repost.pb.js";

export const REPOST_SCHEMA_URI = "vco://schemas/social/repost/v1";

export interface RepostData {
  schema: string;
  originalPostCid: Uint8Array;
  originalAuthorCid: Uint8Array;
  commentary: string;
  timestampMs: bigint;
}

export function encodeRepost(data: RepostData): Uint8Array {
  const msg = Repost.create({
    schema: data.schema,
    originalPostCid: data.originalPostCid,
    originalAuthorCid: data.originalAuthorCid,
    commentary: data.commentary,
    timestampMs: Number(data.timestampMs),
  });
  return Repost.encode(msg).finish();
}

export function decodeRepost(bytes: Uint8Array): RepostData {
  const msg = Repost.decode(bytes);
  return {
    schema: msg.schema,
    originalPostCid: new Uint8Array(msg.originalPostCid),
    originalAuthorCid: new Uint8Array(msg.originalAuthorCid),
    commentary: msg.commentary,
    timestampMs: BigInt(msg.timestampMs?.toString() ?? "0"),
  };
}
