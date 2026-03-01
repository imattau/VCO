import { Thread, ThreadEntry } from "../generated/social/thread.pb.js";
export const THREAD_SCHEMA_URI = "vco://schemas/social/thread/v1";
export interface ThreadEntryData { cid: Uint8Array; schemaUri: string; }
export interface ThreadData { schema: string; title: string; entries: ThreadEntryData[]; timestampMs: bigint; }
export function encodeThread(d: ThreadData): Uint8Array {
  return Thread.encode(Thread.create({
    schema: d.schema, title: d.title,
    entries: d.entries.map(e => ThreadEntry.create({ cid: e.cid, schemaUri: e.schemaUri })),
    timestampMs: Number(d.timestampMs),
  })).finish();
}
export function decodeThread(bytes: Uint8Array): ThreadData {
  const m = Thread.decode(bytes);
  return {
    schema: m.schema ?? "",
    title: m.title ?? "",
    entries: (m.entries ?? []).map(e => ({
      cid: new Uint8Array(e.cid ?? []),
      schemaUri: e.schemaUri ?? ""
    })),
    timestampMs: BigInt(m.timestampMs?.toString() ?? "0")
  };
}
