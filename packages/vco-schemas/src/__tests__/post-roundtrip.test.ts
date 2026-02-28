import { describe, it, expect } from "vitest";
import { encodePost, decodePost, POST_SCHEMA_URI } from "../post.js";

describe("Post encode/decode roundtrip", () => {
  it("encodes and decodes a minimal post", () => {
    const original = {
      schema: POST_SCHEMA_URI,
      content: "Hello VCO world",
      mediaCids: [],
      timestampMs: 1_700_000_000_000n,
      channelId: "general",
    };
    const bytes = encodePost(original);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
    const decoded = decodePost(bytes);
    expect(decoded.schema).toBe(POST_SCHEMA_URI);
    expect(decoded.content).toBe("Hello VCO world");
    expect(decoded.channelId).toBe("general");
    expect(decoded.mediaCids).toHaveLength(0);
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
