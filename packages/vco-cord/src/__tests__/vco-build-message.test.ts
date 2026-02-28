import { describe, it, expect } from "vitest";
import { buildMessage, decodeMessage, generateIdentity } from "../lib/vco.js";
import { decodePost, POST_SCHEMA_URI } from "@vco/vco-schemas";
import { decodeEnvelopeProto } from "@vco/vco-core";

describe("buildMessage / decodeMessage with Post schema", () => {
  it("buildMessage encodes payload as a valid Post protobuf", async () => {
    const identity = generateIdentity("TestUser");
    const msg = await buildMessage("general", "Hello schema world", identity);
    const envelope = decodeEnvelopeProto(msg.rawEnvelope);
    const post = decodePost(envelope.payload);
    expect(post.schema).toBe(POST_SCHEMA_URI);
    expect(post.content).toBe("Hello schema world");
    expect(post.channelId).toBe("general");
  });

  it("decodeMessage extracts content from Post payload", async () => {
    const identity = generateIdentity("TestUser");
    const built = await buildMessage("general", "Roundtrip content", identity);
    const authors = new Map([[built.authorId, "TestUser"]]);
    const decoded = decodeMessage("general", built.rawEnvelope, authors);
    expect(decoded.content).toBe("Roundtrip content");
    expect(decoded.authorName).toBe("TestUser");
    expect(decoded.verified).toBe(true);
    expect(decoded.tampered).toBe(false);
  });
});
