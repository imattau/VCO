import { SequenceManifest } from "./generated/manifest.pb.js";

export const SEQUENCE_MANIFEST_SCHEMA_URI = "vco://schemas/core/sequence-manifest/v1";

export interface SequenceManifestData {
  schema: string;
  chunkCids: Uint8Array[];
  totalSize: bigint;
  mimeType: string;
  previousManifest: Uint8Array;
}

export function encodeSequenceManifest(data: SequenceManifestData): Uint8Array {
  const msg = SequenceManifest.create({
    schema: data.schema,
    chunkCids: data.chunkCids,
    totalSize: Number(data.totalSize),
    mimeType: data.mimeType,
    previousManifest: data.previousManifest,
  });
  return SequenceManifest.encode(msg).finish();
}

export function decodeSequenceManifest(bytes: Uint8Array): SequenceManifestData {
  const msg = SequenceManifest.decode(bytes);
  return {
    schema: msg.schema,
    chunkCids: msg.chunkCids.map((c) => new Uint8Array(c)),
    totalSize: BigInt(msg.totalSize as number),
    mimeType: msg.mimeType,
    previousManifest: new Uint8Array(msg.previousManifest),
  };
}
