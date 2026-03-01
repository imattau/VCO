import { MediaManifest } from "../generated/media/manifest.pb.js";

export const MEDIA_MANIFEST_SCHEMA_URI = "vco://schemas/media/manifest/v1";

export interface MediaManifestData {
  schema: string;
  title: string;
  summary: string;
  showNotes: string;
  contentCid: Uint8Array;
  thumbnailCid: Uint8Array;
  transcriptCid?: Uint8Array;
  durationMs: bigint;
  publishedAtMs: bigint;
  previousItemCid?: Uint8Array;
  contentType: string;
}

export function encodeMediaManifest(data: MediaManifestData): Uint8Array {
  const msg = MediaManifest.create({
    schema: data.schema,
    title: data.title,
    summary: data.summary,
    showNotes: data.showNotes,
    contentCid: data.contentCid,
    thumbnailCid: data.thumbnailCid,
    transcriptCid: data.transcriptCid,
    durationMs: Number(data.durationMs),
    publishedAtMs: Number(data.publishedAtMs),
    previousItemCid: data.previousItemCid,
    contentType: data.contentType
  });
  return MediaManifest.encode(msg).finish();
}

export function decodeMediaManifest(bytes: Uint8Array): MediaManifestData {
  const msg = MediaManifest.decode(bytes);
  return {
    schema: msg.schema,
    title: msg.title,
    summary: msg.summary,
    showNotes: msg.showNotes,
    contentCid: new Uint8Array(msg.contentCid),
    thumbnailCid: new Uint8Array(msg.thumbnailCid),
    transcriptCid: (msg.transcriptCid && msg.transcriptCid.length > 0) ? new Uint8Array(msg.transcriptCid) : undefined,
    durationMs: BigInt(msg.durationMs?.toString() ?? "0"),
    publishedAtMs: BigInt(msg.publishedAtMs?.toString() ?? "0"),
    previousItemCid: (msg.previousItemCid && msg.previousItemCid.length > 0) ? new Uint8Array(msg.previousItemCid) : undefined,
    contentType: msg.contentType
  };
}
