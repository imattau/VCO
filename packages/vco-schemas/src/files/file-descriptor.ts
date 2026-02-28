import { FileDescriptor } from "../generated/files/file-descriptor.pb.js";
export const FILE_DESCRIPTOR_SCHEMA_URI = "vco://schemas/files/file-descriptor/v1";
export interface FileDescriptorData { schema: string; name: string; mimeType: string; size: bigint; rootManifestCid: Uint8Array; previousCid: Uint8Array; timestampMs: bigint; }
export function encodeFileDescriptor(d: FileDescriptorData): Uint8Array {
  return FileDescriptor.encode(FileDescriptor.create({ schema: d.schema, name: d.name, mimeType: d.mimeType, size: Number(d.size), rootManifestCid: d.rootManifestCid, previousCid: d.previousCid, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeFileDescriptor(bytes: Uint8Array): FileDescriptorData {
  const m = FileDescriptor.decode(bytes);
  return { schema: m.schema, name: m.name, mimeType: m.mimeType, size: BigInt(m.size as number), rootManifestCid: new Uint8Array(m.rootManifestCid), previousCid: new Uint8Array(m.previousCid), timestampMs: BigInt(m.timestampMs as number) };
}
