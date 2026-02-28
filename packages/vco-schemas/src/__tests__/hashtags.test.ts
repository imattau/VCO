import { describe, it, expect } from "vitest";
import { encodePost, decodePost, extractHashtags, POST_V2_SCHEMA_URI } from "../post.js";
import { encodeReply, decodeReply, REPLY_SCHEMA_URI } from "../social/reply.js";

describe("Hashtag Support", () => {
  describe("extractHashtags utility", () => {
    it("should extract simple hashtags", () => {
      const text = "Hello #vco #protocol";
      expect(extractHashtags(text)).toEqual(["vco", "protocol"]);
    });

    it("should handle hashtags at start of string", () => {
      expect(extractHashtags("#first post")).toEqual(["first"]);
    });

    it("should handle mixed casing and normalize to lowercase", () => {
      expect(extractHashtags("Love #TypeScript and #VCO")).toEqual(["typescript", "vco"]);
    });

    it("should ignore # without following characters", () => {
      expect(extractHashtags("This is a # test")).toEqual([]);
    });

    it("should handle underscores and hyphens in tags", () => {
      expect(extractHashtags("Check #vco_dev and #web-3")).toEqual(["vco_dev", "web-3"]);
    });

    it("should deduplicate tags", () => {
      expect(extractHashtags("#vco #VCO #vco")).toEqual(["vco"]);
    });
  });

  describe("Post v2 Roundtrip", () => {
    it("should preserve tags during encoding and decoding", () => {
      const data = {
        schema: POST_V2_SCHEMA_URI,
        content: "Testing tags #vco #awesome",
        mediaCids: [],
        timestampMs: BigInt(Date.now()),
        channelId: "general",
        tags: ["vco", "awesome"]
      };

      const encoded = encodePost(data);
      const decoded = decodePost(encoded);

      expect(decoded.schema).toBe(POST_V2_SCHEMA_URI);
      expect(decoded.tags).toEqual(["vco", "awesome"]);
      expect(decoded.content).toBe(data.content);
    });

    it("should default to empty array if no tags provided", () => {
      const data = {
        schema: POST_V2_SCHEMA_URI,
        content: "No tags here",
        mediaCids: [],
        timestampMs: BigInt(Date.now()),
        channelId: "general"
      };

      const encoded = encodePost(data);
      const decoded = decodePost(encoded);
      expect(decoded.tags).toEqual([]);
    });
  });

  describe("Reply Roundtrip with Tags", () => {
    it("should preserve tags in replies", () => {
      const data = {
        schema: REPLY_SCHEMA_URI,
        parentCid: new Uint8Array(32),
        content: "Replying with #vco",
        mediaCids: [],
        timestampMs: BigInt(Date.now()),
        channelId: "general",
        tags: ["vco"]
      };

      const encoded = encodeReply(data);
      const decoded = decodeReply(encoded);

      expect(decoded.tags).toEqual(["vco"]);
    });
  });
});
