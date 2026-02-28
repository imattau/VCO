import { Reply } from "../generated/social/reply.pb.js";
export const REPLY_SCHEMA_URI = "vco://schemas/social/reply/v1";
export interface ReplyData { schema: string; parentCid: Uint8Array; content: string; mediaCids: Uint8Array[]; timestampMs: bigint; channelId: string; tags?: string[]; }
export function encodeReply(d: ReplyData): Uint8Array {
  return Reply.encode(Reply.create({ 
    schema: d.schema, 
    parentCid: d.parentCid, 
    content: d.content, 
    mediaCids: d.mediaCids, 
    timestampMs: Number(d.timestampMs), 
    channelId: d.channelId,
    tags: d.tags ?? [] 
  })).finish();
}
export function decodeReply(bytes: Uint8Array): ReplyData {
  const m = Reply.decode(bytes);
  return { 
    schema: m.schema, 
    parentCid: new Uint8Array(m.parentCid), 
    content: m.content, 
    mediaCids: m.mediaCids.map(c => new Uint8Array(c)), 
    timestampMs: BigInt(m.timestampMs as number), 
    channelId: m.channelId,
    tags: m.tags ?? []
  };
}
