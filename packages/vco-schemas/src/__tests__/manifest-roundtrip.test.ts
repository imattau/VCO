import { describe, it, expect } from "vitest";
import {
  encodeSequenceManifest,
  decodeSequenceManifest,
  SEQUENCE_MANIFEST_SCHEMA_URI,
} from "../manifest.js";

describe("SequenceManifest encode/decode roundtrip", () => {
  it("roundtrips a manifest with two chunks", () => {
    const chunk0 = new Uint8Array(34).fill(0x01);
    const chunk1 = new Uint8Array(34).fill(0x02);
    const bytes = encodeSequenceManifest({
      schema: SEQUENCE_MANIFEST_SCHEMA_URI,
      chunkCids: [chunk0, chunk1],
      totalSize: 2_000_000n,
      mimeType: "image/jpeg",
      previousManifest: new Uint8Array(0),
    });
    const decoded = decodeSequenceManifest(bytes);
    expect(decoded.chunkCids).toHaveLength(2);
    expect(decoded.chunkCids[0]).toEqual(chunk0);
    expect(decoded.chunkCids[1]).toEqual(chunk1);
    expect(decoded.totalSize).toBe(2_000_000n);
    expect(decoded.mimeType).toBe("image/jpeg");
  });

  it("roundtrips an empty chunk list", () => {
    const bytes = encodeSequenceManifest({
      schema: SEQUENCE_MANIFEST_SCHEMA_URI,
      chunkCids: [],
      totalSize: 0n,
      mimeType: "application/octet-stream",
      previousManifest: new Uint8Array(0),
    });
    const decoded = decodeSequenceManifest(bytes);
    expect(decoded.chunkCids).toHaveLength(0);
  });
});
