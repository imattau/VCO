import { Directory, DirectoryEntry } from "../generated/files/directory.pb.js";
export const DIRECTORY_SCHEMA_URI = "vco://schemas/files/directory/v1";
export interface DirectoryEntryData { cid: Uint8Array; schemaUri: string; name: string; }
export interface DirectoryData { schema: string; name: string; entries: DirectoryEntryData[]; previousCid: Uint8Array; timestampMs: bigint; }
export function encodeDirectory(d: DirectoryData): Uint8Array {
  return Directory.encode(Directory.create({
    schema: d.schema, name: d.name,
    entries: d.entries.map(e => DirectoryEntry.create({ cid: e.cid, schemaUri: e.schemaUri, name: e.name })),
    previousCid: d.previousCid, timestampMs: Number(d.timestampMs),
  })).finish();
}
export function decodeDirectory(bytes: Uint8Array): DirectoryData {
  const m = Directory.decode(bytes);
  return {
    schema: m.schema ?? "",
    name: m.name ?? "",
    entries: (m.entries ?? []).map(e => ({
      cid: new Uint8Array(e.cid ?? []),
      schemaUri: e.schemaUri ?? "",
      name: e.name ?? ""
    })),
    previousCid: new Uint8Array(m.previousCid ?? []),
    timestampMs: BigInt(m.timestampMs?.toString() ?? "0")
  };
}
