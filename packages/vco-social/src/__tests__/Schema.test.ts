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
  encodeReaction,
  decodeReaction,
  encodeRepost,
  decodeRepost,
  encodeDirectMessage,
  decodeDirectMessage,
  POST_SCHEMA_URI,
  PROFILE_SCHEMA_URI,
  FOLLOW_SCHEMA_URI,
  TOMBSTONE_SCHEMA_URI,
  REPORT_SCHEMA_URI,
  REPLY_SCHEMA_URI,
  REACTION_SCHEMA_URI,
  REPOST_SCHEMA_URI,
  DM_SCHEMA_URI
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

  it('should correctly identify schema URIs in raw payloads', () => {
    // This tests our heuristic used in SocialContext
    const postEncoded = encodePost({
      schema: POST_SCHEMA_URI,
      content: "test",
      timestampMs: BigInt(0),
      mediaCids: [],
      tags: []
    });

    const payloadRaw = new TextDecoder().decode(postEncoded);
    expect(payloadRaw.includes(POST_SCHEMA_URI)).toBe(true);
  });

  it('should maintain integrity through Reply encoding/decoding', () => {
    const parentCid = new Uint8Array([10, 20, 30]);
    const original = {
      schema: REPLY_SCHEMA_URI,
      parentCid,
      content: "Great post!",
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeReply(original);
    expect(encoded).toBeInstanceOf(Uint8Array);

    const decoded = decodeReply(encoded);
    expect(decoded.content).toBe(original.content);
    expect(decoded.parentCid).toEqual(parentCid);
  });

  it('should maintain integrity through Reaction encoding/decoding', () => {
    const targetCid = new Uint8Array([1, 2, 3]);
    const original = {
      schema: REACTION_SCHEMA_URI,
      targetCid,
      emoji: '❤️',
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeReaction(original);
    expect(encoded).toBeInstanceOf(Uint8Array);

    const decoded = decodeReaction(encoded);
    expect(decoded.emoji).toBe('❤️');
    expect(decoded.targetCid).toEqual(targetCid);
  });

  it('should maintain integrity through Repost encoding/decoding', () => {
    const originalPostCid = new Uint8Array([4, 5, 6]);
    const original = {
      schema: REPOST_SCHEMA_URI,
      originalPostCid,
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeRepost(original);
    expect(encoded).toBeInstanceOf(Uint8Array);

    const decoded = decodeRepost(encoded);
    expect(decoded.originalPostCid).toEqual(originalPostCid);
  });

  it('should maintain integrity through DirectMessage encoding/decoding', () => {
    const original = {
      schema: DM_SCHEMA_URI,
      recipientCid: new Uint8Array(32).fill(2),
      senderCid: new Uint8Array(32).fill(1),
      ephemeralPubkey: new Uint8Array(32).fill(3),
      nonce: new Uint8Array(12).fill(4),
      encryptedPayload: new Uint8Array([9, 8, 7, 6]),
      timestampMs: BigInt(Date.now())
    };

    const encoded = encodeDirectMessage(original);
    expect(encoded).toBeInstanceOf(Uint8Array);

    const decoded = decodeDirectMessage(encoded);
    expect(decoded.recipientCid).toEqual(original.recipientCid);
    expect(decoded.encryptedPayload).toEqual(original.encryptedPayload);
    expect(decoded.nonce).toEqual(original.nonce);
  });

  it('should embed schema URI in payload for all schema types', () => {
    const schemas = [
      [REPLY_SCHEMA_URI, encodeReply({ schema: REPLY_SCHEMA_URI, parentCid: new Uint8Array([1]), content: 'x', timestampMs: BigInt(0) })],
      [REACTION_SCHEMA_URI, encodeReaction({ schema: REACTION_SCHEMA_URI, targetCid: new Uint8Array([1]), emoji: '👍', timestampMs: BigInt(0) })],
      [REPOST_SCHEMA_URI, encodeRepost({ schema: REPOST_SCHEMA_URI, originalPostCid: new Uint8Array([1]), timestampMs: BigInt(0) })],
    ] as [string, Uint8Array][];

    for (const [uri, encoded] of schemas) {
      const raw = new TextDecoder().decode(encoded);
      expect(raw.includes(uri), `${uri} not found in encoded payload`).toBe(true);
    }
  });

});
