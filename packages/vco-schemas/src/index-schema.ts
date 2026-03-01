import { KeywordIndex } from "./generated/index.pb.js";

export const KEYWORD_INDEX_SCHEMA_URI = "vco://schemas/index/keyword/v1";

export interface KeywordIndexEntry {
  cid: Uint8Array;
  weight?: number;
  indexedAtMs?: bigint;
}

export interface KeywordIndexData {
  schema: string;
  keyword: string;
  entries: KeywordIndexEntry[];
  nextPageCid?: Uint8Array;
}

export function encodeKeywordIndex(data: KeywordIndexData): Uint8Array {
  const msg = KeywordIndex.create({
    schema: data.schema,
    keyword: data.keyword,
    entries: data.entries.map(e => ({
      cid: e.cid,
      weight: e.weight ?? 0,
      indexedAtMs: Number(e.indexedAtMs ?? 0)
    })),
    nextPageCid: data.nextPageCid
  });
  return KeywordIndex.encode(msg).finish();
}

export function decodeKeywordIndex(bytes: Uint8Array): KeywordIndexData {
  const msg = KeywordIndex.decode(bytes);
  return {
    schema: msg.schema,
    keyword: msg.keyword,
    entries: msg.entries.map(e => ({
      cid: new Uint8Array(e.cid),
      weight: e.weight || undefined,
      indexedAtMs: (e.indexedAtMs && e.indexedAtMs.toString() !== "0") ? BigInt(e.indexedAtMs.toString()) : undefined
    })),
    nextPageCid: (msg.nextPageCid && msg.nextPageCid.length > 0) ? new Uint8Array(msg.nextPageCid) : undefined
  };
}
