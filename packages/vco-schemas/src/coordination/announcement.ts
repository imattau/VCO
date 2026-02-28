import { Announcement } from "../generated/coordination/announcement.pb.js";
export const ANNOUNCEMENT_SCHEMA_URI = "vco://schemas/coordination/announcement/v1";
export interface AnnouncementData { schema: string; content: string; priority: string; mediaCids: Uint8Array[]; timestampMs: bigint; }
export function encodeAnnouncement(d: AnnouncementData): Uint8Array {
  return Announcement.encode(Announcement.create({ schema: d.schema, content: d.content, priority: d.priority, mediaCids: d.mediaCids, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeAnnouncement(bytes: Uint8Array): AnnouncementData {
  const m = Announcement.decode(bytes);
  return { schema: m.schema, content: m.content, priority: m.priority, mediaCids: m.mediaCids.map(c => new Uint8Array(c)), timestampMs: BigInt(m.timestampMs as number) };
}
