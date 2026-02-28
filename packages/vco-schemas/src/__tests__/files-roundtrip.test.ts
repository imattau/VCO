import { describe, it, expect } from "vitest";
import { encodeFileDescriptor, decodeFileDescriptor, FILE_DESCRIPTOR_SCHEMA_URI } from "../files/file-descriptor.js";
import { encodeDirectory, decodeDirectory, DIRECTORY_SCHEMA_URI } from "../files/directory.js";

const cid = () => new Uint8Array(34).fill(0xef);

describe("FileDescriptor roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeFileDescriptor({ schema: FILE_DESCRIPTOR_SCHEMA_URI, name: "photo.jpg", mimeType: "image/jpeg", size: 2_000_000n, rootManifestCid: cid(), previousCid: new Uint8Array(0), timestampMs: 0n });
    const d = decodeFileDescriptor(bytes);
    expect(d.name).toBe("photo.jpg");
    expect(d.mimeType).toBe("image/jpeg");
    expect(d.size).toBe(2_000_000n);
    expect(d.rootManifestCid).toEqual(cid());
  });
});

describe("Directory roundtrip", () => {
  it("roundtrips entries with schema hints", () => {
    const bytes = encodeDirectory({
      schema: DIRECTORY_SCHEMA_URI,
      name: "photos",
      entries: [{ cid: cid(), schemaUri: FILE_DESCRIPTOR_SCHEMA_URI, name: "photo.jpg" }],
      previousCid: new Uint8Array(0),
      timestampMs: 0n,
    });
    const d = decodeDirectory(bytes);
    expect(d.name).toBe("photos");
    expect(d.entries).toHaveLength(1);
    expect(d.entries[0].name).toBe("photo.jpg");
    expect(d.entries[0].schemaUri).toBe(FILE_DESCRIPTOR_SCHEMA_URI);
    expect(d.entries[0].cid).toEqual(cid());
  });

  it("roundtrips empty directory", () => {
    const bytes = encodeDirectory({ schema: DIRECTORY_SCHEMA_URI, name: "empty", entries: [], previousCid: new Uint8Array(0), timestampMs: 0n });
    const d = decodeDirectory(bytes);
    expect(d.entries).toHaveLength(0);
  });
});
