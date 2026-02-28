import { Reply } from "../generated/social/reply.pb.js";
export const REPLY_SCHEMA_URI = "vco://schemas/social/reply/v1";
export const REPLY_V2_SCHEMA_URI = "vco://schemas/social/reply/v2";

export interface ReplyData { 
  schema: string; 
  parentCid: Uint8Array; 
  content: string; 
  mediaCids: Uint8Array[]; 
  timestampMs: bigint; 
  /** @deprecated Use tags with 'c:' prefix in v2 */
  channelId?: string; 
  tags?: string[]; 
}

export function encodeReply(d: ReplyData): Uint8Array {
  const tags = [...(d.tags ?? [])];
  if (d.schema === REPLY_V2_SCHEMA_URI && d.channelId) {
    const channelTag = `c:${d.channelId}`;
    if (!tags.includes(channelTag)) tags.push(channelTag);
  }

  return Reply.encode(Reply.create({ 
    schema: d.schema, 
    parentCid: d.parentCid, 
    content: d.content, 
    mediaCids: d.mediaCids, 
    timestampMs: Number(d.timestampMs), 
    channelId: d.schema === REPLY_V2_SCHEMA_URI ? "" : (d.channelId ?? ""),
    tags: tags
  })).finish();
}

export function decodeReply(bytes: Uint8Array): ReplyData {
  const m = Reply.decode(bytes);
  const isV2 = m.schema === REPLY_V2_SCHEMA_URI;
  let channelId = m.channelId;

  if (isV2) {
    const channelTag = m.tags.find(t => t.startsWith('c:'));
    if (channelTag) channelId = channelTag.slice(2);
  }

  return { 
    schema: m.schema, 
    parentCid: new Uint8Array(m.parentCid), 
    content: m.content, 
    mediaCids: m.mediaCids.map(c => new Uint8Array(c)), 
    timestampMs: BigInt(m.timestampMs as number), 
    channelId: channelId || undefined,
    tags: m.tags ?? []
  };
}
