import { Post } from "./generated/post.pb.js";

export const POST_SCHEMA_URI = "vco://schemas/social/post/v1";
export const POST_V2_SCHEMA_URI = "vco://schemas/social/post/v2";
export const POST_V3_SCHEMA_URI = "vco://schemas/social/post/v3";

export interface PostData {
  schema: string;
  content: string;
  mediaCids: Uint8Array[];
  timestampMs: bigint;
  /** @deprecated Use tags with 'c:' prefix in v3 */
  channelId?: string;
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
  const tags = [...(data.tags ?? [])];
  
  // In v3, if channelId is provided, we convert it to a 'c:' tag if not already present
  if (data.schema === POST_V3_SCHEMA_URI && data.channelId) {
    const channelTag = `c:${data.channelId}`;
    if (!tags.includes(channelTag)) {
      tags.push(channelTag);
    }
  }

  const msg = Post.create({
    schema: data.schema,
    content: data.content,
    mediaCids: data.mediaCids,
    timestampMs: Number(data.timestampMs),
    channelId: data.schema === POST_V3_SCHEMA_URI ? "" : (data.channelId ?? ""),
    tags: tags,
  });
  return Post.encode(msg).finish();
}

export function decodePost(bytes: Uint8Array, options: DecodePostOptions = {}): PostData {
  const msg = Post.decode(bytes);
  const isV1orV2 = msg.schema === POST_SCHEMA_URI || msg.schema === POST_V2_SCHEMA_URI;
  const isV3 = msg.schema === POST_V3_SCHEMA_URI;

  if (options.strict && !isV1orV2 && !isV3) {
    throw new Error(`Unexpected schema URI: got "${msg.schema}"`);
  }

  let channelId = msg.channelId;
  
  // In v3, extract channelId from 'c:' tag if present
  if (isV3) {
    const channelTag = msg.tags.find(t => t.startsWith('c:'));
    if (channelTag) {
      channelId = channelTag.slice(2);
    }
  }

  return {
    schema: msg.schema,
    content: msg.content,
    mediaCids: msg.mediaCids.map((c) => new Uint8Array(c)),
    timestampMs: BigInt(msg.timestampMs as number),
    channelId: channelId || undefined,
    tags: msg.tags ?? [],
  };
}
