import { describe, it, expect } from 'vitest';
import { 
  encodePost, 
  decodePost, 
  encodeProfile, 
  decodeProfile,
  encodeFollow,
  decodeFollow,
  encodeTombstone,
  decodeTombstone,
  encodeReport,
  decodeReport,
  encodeReply,
  decodeReply,
  encodeRepost,
  decodeRepost,
  POST_SCHEMA_URI,
  PROFILE_SCHEMA_URI,
  FOLLOW_SCHEMA_URI,
  TOMBSTONE_SCHEMA_URI,
  REPORT_SCHEMA_URI,
  REPLY_SCHEMA_URI,
  REPOST_SCHEMA_URI,
  REACTION_SCHEMA_URI
} from '@vco/vco-schemas';

describe('VCO Schema Integrity Tests', () => {
  
  it('should maintain integrity through Post encoding/decoding', () => {
    const original = {
      schema: POST_SCHEMA_URI,
      content: "Hello #VCO Swarm!",
      timestampMs: BigInt(Date.now()),
      mediaCids: [new Uint8Array([1, 2, 3])],
      tags: ["vco"]
    };

    const encoded = encodePost(original);
    expect(encoded).toBeInstanceOf(Uint8Array);

    const decoded = decodePost(encoded);
    expect(decoded.content).toBe(original.content);
    expect(decoded.tags).toContain("vco");
    expect(decoded.mediaCids[0]).toEqual(original.mediaCids[0]);
  });

  it('should maintain integrity through Profile encoding/decoding', () => {
    const original = {
      schema: PROFILE_SCHEMA_URI,
      displayName: "Alice Swarm",
      bio: "Decentralized dev",
      avatarCid: new Uint8Array([4, 5, 6]),
      previousManifest: new Uint8Array(0),
      encryptionPubkey: new Uint8Array(32).fill(1)
    };

    const encoded = encodeProfile(original);
    const decoded = decodeProfile(encoded);

    expect(decoded.displayName).toBe(original.displayName);
    expect(decoded.bio).toBe(original.bio);
    expect(decoded.encryptionPubkey).toEqual(original.encryptionPubkey);
  });

  it('should maintain integrity through Follow encoding/decoding', () => {
    const original = {
      schema: FOLLOW_SCHEMA_URI,
      subjectKey: new Uint8Array([7, 8, 9]),
      action: "follow" as const,
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeFollow(original);
    const decoded = decodeFollow(encoded);

    expect(decoded.action).toBe("follow");
    expect(decoded.subjectKey).toEqual(original.subjectKey);
  });

  it('should maintain integrity through Tombstone encoding/decoding', () => {
    const targetCid = new Uint8Array([10, 11, 12]);
    const original = {
      schema: TOMBSTONE_SCHEMA_URI,
      targetCid,
      reason: "User requested deletion",
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeTombstone(original);
    const decoded = decodeTombstone(encoded);

    expect(decoded.reason).toBe(original.reason);
    expect(decoded.targetCid).toEqual(original.targetCid);
  });

  it('should maintain integrity through Moderation Report encoding/decoding', () => {
    const targetCid = new Uint8Array([13, 14, 15]);
    const original = {
      schema: REPORT_SCHEMA_URI,
      targetCid,
      reason: 1, // Spam
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeReport(original);
    const decoded = decodeReport(encoded);

    expect(decoded.reason).toBe(1);
    expect(decoded.targetCid).toEqual(original.targetCid);
  });

  it('should maintain integrity through Reply encoding/decoding', () => {
    const original = {
      schema: REPLY_SCHEMA_URI,
      parentCid: new Uint8Array([1, 2, 3]),
      content: "Nice post!",
      timestampMs: BigInt(Date.now()),
      mediaCids: [],
      tags: []
    };

    const encoded = encodeReply(original);
    const decoded = decodeReply(encoded);

    expect(decoded.content).toBe(original.content);
    expect(decoded.parentCid).toEqual(original.parentCid);
  });

  it('should maintain integrity through Repost encoding/decoding', () => {
    const original = {
      schema: REPOST_SCHEMA_URI,
      originalPostCid: new Uint8Array([4, 5, 6]),
      originalAuthorCid: new Uint8Array([7, 8, 9]),
      commentary: "Check this out",
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeRepost(original);
    const decoded = decodeRepost(encoded);

    expect(decoded.commentary).toBe(original.commentary);
    expect(decoded.originalPostCid).toEqual(original.originalPostCid);
  });

  it('should correctly identify schema URIs in raw payloads', () => {
    // Tests for our heuristic used in SocialContext
    const testCases: [string, Uint8Array][] = [
      [POST_SCHEMA_URI, encodePost({ schema: POST_SCHEMA_URI, content: 'x', timestampMs: BigInt(0), mediaCids: [], tags: [] })],
      [REPLY_SCHEMA_URI, encodeReply({ schema: REPLY_SCHEMA_URI, parentCid: new Uint8Array([1]), content: 'x', timestampMs: BigInt(0), mediaCids: [], tags: [] })],
      [FOLLOW_SCHEMA_URI, encodeFollow({ schema: FOLLOW_SCHEMA_URI, subjectKey: new Uint8Array([1]), action: 'follow', timestampMs: BigInt(0) })],
      [REPOST_SCHEMA_URI, encodeRepost({ schema: REPOST_SCHEMA_URI, originalPostCid: new Uint8Array([1]), originalAuthorCid: new Uint8Array([2]), commentary: 'x', timestampMs: BigInt(0) })]
    ];

    for (const [uri, encoded] of testCases) {
      const payloadRaw = new TextDecoder().decode(encoded);
      expect(payloadRaw.includes(uri)).toBe(true);
    }
  });

});
