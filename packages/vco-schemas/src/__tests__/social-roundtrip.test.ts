import { describe, it, expect } from "vitest";
import { encodeReaction, decodeReaction, REACTION_SCHEMA_URI } from "../social/reaction.js";
import { encodeReply, decodeReply, REPLY_SCHEMA_URI, REPLY_V2_SCHEMA_URI } from "../social/reply.js";
import { encodeFollow, decodeFollow, FOLLOW_SCHEMA_URI } from "../social/follow.js";
import { encodeTombstone, decodeTombstone, TOMBSTONE_SCHEMA_URI } from "../social/tombstone.js";
import { encodeThread, decodeThread, THREAD_SCHEMA_URI } from "../social/thread.js";

const cid = () => new Uint8Array(34).fill(0xab);

describe("Reaction roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeReaction({ schema: REACTION_SCHEMA_URI, targetCid: cid(), emoji: "👍", timestampMs: 1_700_000_000_000n });
    const d = decodeReaction(bytes);
    expect(d.schema).toBe(REACTION_SCHEMA_URI);
    expect(d.targetCid).toEqual(cid());
    expect(d.emoji).toBe("👍");
    expect(d.timestampMs).toBe(1_700_000_000_000n);
  });
});

describe("Reply roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeReply({ schema: REPLY_SCHEMA_URI, parentCid: cid(), content: "hello", mediaCids: [], timestampMs: 0n, channelId: "general" });
    const d = decodeReply(bytes);
    expect(d.content).toBe("hello");
    expect(d.parentCid).toEqual(cid());
    expect(d.channelId).toBe("general");
  });

  it("migrates channelId to tags in v2", () => {
    const bytes = encodeReply({ 
      schema: REPLY_V2_SCHEMA_URI, 
      parentCid: cid(), 
      content: "v2 reply", 
      mediaCids: [], 
      timestampMs: 0n, 
      channelId: "dev" 
    });
    const d = decodeReply(bytes);
    expect(d.schema).toBe(REPLY_V2_SCHEMA_URI);
    expect(d.channelId).toBe("dev");
    expect(d.tags).toContain("c:dev");
  });
});

describe("Follow roundtrip", () => {
  it("roundtrips follow action", () => {
    const key = new Uint8Array(34).fill(0x12);
    const bytes = encodeFollow({ schema: FOLLOW_SCHEMA_URI, subjectKey: key, action: "follow", timestampMs: 0n });
    const d = decodeFollow(bytes);
    expect(d.subjectKey).toEqual(key);
    expect(d.action).toBe("follow");
  });
});

describe("Tombstone roundtrip", () => {
  it("roundtrips target cid and reason", () => {
    const bytes = encodeTombstone({ schema: TOMBSTONE_SCHEMA_URI, targetCid: cid(), reason: "spam", timestampMs: 0n });
    const d = decodeTombstone(bytes);
    expect(d.targetCid).toEqual(cid());
    expect(d.reason).toBe("spam");
  });
});

describe("Thread roundtrip", () => {
  it("roundtrips entries", () => {
    const bytes = encodeThread({
      schema: THREAD_SCHEMA_URI,
      title: "My thread",
      entries: [{ cid: cid(), schemaUri: "vco://schemas/social/post/v1" }],
      timestampMs: 0n,
    });
    const d = decodeThread(bytes);
    expect(d.title).toBe("My thread");
    expect(d.entries).toHaveLength(1);
    expect(d.entries[0].schemaUri).toBe("vco://schemas/social/post/v1");
    expect(d.entries[0].cid).toEqual(cid());
  });

  it("roundtrips empty entries", () => {
    const bytes = encodeThread({ schema: THREAD_SCHEMA_URI, title: "", entries: [], timestampMs: 0n });
    const d = decodeThread(bytes);
    expect(d.entries).toHaveLength(0);
  });
});
