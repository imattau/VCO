import { Post } from "./generated/post.pb.js";

export const POST_SCHEMA_URI = "vco://schemas/social/post/v1";

export interface PostData {
  schema: string;
  content: string;
  mediaCids: Uint8Array[];
  timestampMs: bigint;
  channelId: string;
}

export interface DecodePostOptions {
  strict?: boolean;
}

export function encodePost(data: PostData): Uint8Array {
  const msg = Post.create({
    schema: data.schema,
    content: data.content,
    mediaCids: data.mediaCids,
    timestampMs: Number(data.timestampMs),
    channelId: data.channelId,
  });
  return Post.encode(msg).finish();
}

export function decodePost(bytes: Uint8Array, options: DecodePostOptions = {}): PostData {
  const msg = Post.decode(bytes);
  if (options.strict && msg.schema !== POST_SCHEMA_URI) {
    throw new Error(`Unexpected schema URI: expected "${POST_SCHEMA_URI}", got "${msg.schema}"`);
  }
  return {
    schema: msg.schema,
    content: msg.content,
    mediaCids: msg.mediaCids.map((c) => new Uint8Array(c)),
    timestampMs: BigInt(msg.timestampMs as number),
    channelId: msg.channelId,
  };
}
