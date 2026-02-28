import { describe, it, expect } from "vitest";
import { encodePost, decodePost, POST_SCHEMA_URI, POST_V3_SCHEMA_URI } from "../post.js";

describe("Post encode/decode roundtrip", () => {
  it("encodes and decodes a minimal post (v1)", () => {
    const original = {
      schema: POST_SCHEMA_URI,
      content: "Hello VCO world",
      mediaCids: [],
      timestampMs: 1_700_000_000_000n,
      channelId: "general",
    };
    const bytes = encodePost(original);
    const decoded = decodePost(bytes);
    expect(decoded.schema).toBe(POST_SCHEMA_URI);
    expect(decoded.channelId).toBe("general");
  });

  it("migrates channelId to tags in v3", () => {
    const original = {
      schema: POST_V3_SCHEMA_URI,
      content: "V3 migration test",
      mediaCids: [],
      timestampMs: BigInt(Date.now()),
      channelId: "vco-dev",
    };
    const bytes = encodePost(original);
    const decoded = decodePost(bytes);
    expect(decoded.schema).toBe(POST_V3_SCHEMA_URI);
    expect(decoded.channelId).toBe("vco-dev");
    expect(decoded.tags).toContain("c:vco-dev");
  });

  it("handles posts without channelId in v3", () => {
    const original = {
      schema: POST_V3_SCHEMA_URI,
      content: "Generic post",
      mediaCids: [],
      timestampMs: 0n,
      tags: ["tag1"]
    };
    const bytes = encodePost(original);
    const decoded = decodePost(bytes);
    expect(decoded.channelId).toBeUndefined();
    expect(decoded.tags).toEqual(["tag1"]);
  });

  it("roundtrips media_cids as Uint8Array elements", () => {
    const cid = new Uint8Array(34).fill(0xab);
    const bytes = encodePost({
      schema: POST_SCHEMA_URI,
      content: "with media",
      mediaCids: [cid],
      timestampMs: 0n,
      channelId: "",
    });
    const decoded = decodePost(bytes);
    expect(decoded.mediaCids).toHaveLength(1);
    expect(decoded.mediaCids[0]).toEqual(cid);
  });

  it("rejects bytes with wrong schema URI", () => {
    const bytes = encodePost({
      schema: "vco://schemas/wrong/v99",
      content: "bad schema",
      mediaCids: [],
      timestampMs: 0n,
      channelId: "",
    });
    expect(() => decodePost(bytes, { strict: true })).toThrow(/schema/i);
  });
});
