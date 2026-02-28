import { Post } from "./generated/post.pb.js";

export const POST_SCHEMA_URI = "vco://schemas/social/post/v1";
export const POST_V2_SCHEMA_URI = "vco://schemas/social/post/v2";

export interface PostData {
  schema: string;
  content: string;
  mediaCids: Uint8Array[];
  timestampMs: bigint;
  channelId: string;
  /** Structured tags (hashtags) for discovery. */
  tags?: string[];
}

export interface DecodePostOptions {
  strict?: boolean;
}

/**
 * Extracts hashtags from a text string.
 * Matches words starting with # (e.g., #vco, #protocol).
 */
export function extractHashtags(text: string): string[] {
  const matches = text.matchAll(/(?:^|\s)#([\w\d_-]+)/g);
  const tags = new Set<string>();
  for (const match of matches) {
    if (match[1]) tags.add(match[1].toLowerCase());
  }
  return Array.from(tags);
}

export function encodePost(data: PostData): Uint8Array {
  const msg = Post.create({
    schema: data.schema,
    content: data.content,
    mediaCids: data.mediaCids,
    timestampMs: Number(data.timestampMs),
    channelId: data.channelId,
    tags: data.tags ?? [],
  });
  return Post.encode(msg).finish();
}

export function decodePost(bytes: Uint8Array, options: DecodePostOptions = {}): PostData {
  const msg = Post.decode(bytes);
  if (options.strict && msg.schema !== POST_SCHEMA_URI && msg.schema !== POST_V2_SCHEMA_URI) {
    throw new Error(`Unexpected schema URI: got "${msg.schema}"`);
  }
  return {
    schema: msg.schema,
    content: msg.content,
    mediaCids: msg.mediaCids.map((c) => new Uint8Array(c)),
    timestampMs: BigInt(msg.timestampMs as number),
    channelId: msg.channelId,
    tags: msg.tags ?? [],
  };
}
