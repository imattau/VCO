import { describe, it, expect, vi } from 'vitest';
import { FeedProcessor } from '../lib/FeedProcessor';
import * as Constants from '../lib/constants';

// Mock dependencies
vi.mock('@vco/vco-schemas', () => ({
  decodePost: vi.fn(() => ({ schema: 'vco://schemas/post/1.0.0', content: 'Post Content', timestampMs: BigInt(1000) })),
  decodeReply: vi.fn(() => ({ schema: 'vco://schemas/reply/1.0.0', parentCid: new Uint8Array([1,1,1]), content: 'Reply Content', timestampMs: BigInt(1100) })),
  decodeReaction: vi.fn(() => ({ schema: 'vco://schemas/reaction/1.0.0', targetCid: new Uint8Array([1,1,1]), emoji: '❤️', timestampMs: BigInt(1200) })),
  decodeRepost: vi.fn(() => ({ schema: 'vco://schemas/repost/1.0.0', originalPostCid: new Uint8Array([1,1,1]), timestampMs: BigInt(1300) })),
  decodeFollow: vi.fn(() => ({ schema: 'vco://schemas/follow/1.0.0', action: 'follow', subjectKey: new Uint8Array([2,2,2]) })),
}));

vi.mock('@vco/vco-core', () => ({
  decodeEnvelopeProto: vi.fn((bytes) => {
    // In our tests, we use the payload byte to determine the creator and the hash
    // bytes[0] is the payload content (which we set to 0x11 for my post, etc)
    const isMe = bytes[0] === 0xFF;
    const creatorId = isMe ? new Uint8Array([0xFF]) : new Uint8Array([0xAA]);
    
    // We'll use the payload byte as the "hash" so we can link them
    const hashByte = bytes[1] || 0;
    const hash = new Uint8Array([hashByte, hashByte, hashByte]);
    
    return {
      header: { creatorId },
      headerHash: hash,
      payload: bytes // Keep it for the TextDecoder
    };
  }),
}));

describe('FeedProcessor Unit Tests', () => {
  const myCreatorIdHex = "ff";
  const myProfile: any = { displayName: "Me" };
  const profileMap = new Map();

  it('should generate a notification when someone replies to my post', () => {
    // 1. My post (Hash [1,1,1])
    const postEnv = {
      cid: btoa(String.fromCharCode(1,1,1)),
      payload: btoa(String.fromCharCode(0xFF, 1) + Constants.POST_SCHEMA_URI), 
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    // 2. A reply from someone else to my post (parentCid [1,1,1])
    const replyEnv = {
      cid: btoa(String.fromCharCode(2,2,2)),
      payload: btoa(String.fromCharCode(0xAA, 2) + Constants.REPLY_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const envelopes = [postEnv, replyEnv];
    const results = FeedProcessor.process(envelopes, myProfile, profileMap, myCreatorIdHex);

    expect(results.notifications.length).toBe(1);
    expect(results.notifications[0].type).toBe(1); // Reply
  });

  it('should generate a notification when someone likes my post', () => {
    // 1. My post
    const postEnv = {
      cid: btoa(String.fromCharCode(1,1,1)),
      payload: btoa(String.fromCharCode(0xFF, 1) + Constants.POST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    // 2. Reaction from someone else
    const reactionEnv = {
      cid: btoa(String.fromCharCode(3,3,3)),
      payload: btoa(String.fromCharCode(0xAA, 3) + Constants.REACTION_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const envelopes = [postEnv, reactionEnv];
    const results = FeedProcessor.process(envelopes, myProfile, profileMap, myCreatorIdHex);

    expect(results.notifications.length).toBe(1);
    expect(results.notifications[0].type).toBe(3); // Reaction
  });

  it('should NOT generate a notification for my own interactions', () => {
    const postEnv = {
      cid: btoa(String.fromCharCode(1,1,1)),
      payload: btoa(String.fromCharCode(0xFF, 1) + Constants.POST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const myReplyEnv = {
      cid: btoa(String.fromCharCode(4,4,4)),
      payload: btoa(String.fromCharCode(0xFF, 4) + Constants.REPLY_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const envelopes = [postEnv, myReplyEnv];
    const results = FeedProcessor.process(envelopes, myProfile, profileMap, myCreatorIdHex);

    expect(results.notifications.length).toBe(0);
  });
});

describe('FeedProcessor state building', () => {
  const myCreatorIdHex = "ff";
  const myProfile: any = { displayName: "Me" };
  const profileMap = new Map();

  it('should add posts to feedItems', () => {
    const postEnv = {
      cid: btoa(String.fromCharCode(1,1,1)),
      payload: btoa(String.fromCharCode(0xFF, 1) + Constants.POST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const results = FeedProcessor.process([postEnv], myProfile, profileMap, myCreatorIdHex);

    expect(results.feedItems).toHaveLength(1);
    expect(results.feedItems[0].authorProfile.displayName).toBe('Me');
  });

  it('should add replies to replyItems (not feedItems)', () => {
    const replyEnv = {
      cid: btoa(String.fromCharCode(2,2,2)),
      payload: btoa(String.fromCharCode(0xAA, 2) + Constants.REPLY_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const results = FeedProcessor.process([replyEnv], myProfile, profileMap, myCreatorIdHex);

    expect(results.replyItems).toHaveLength(1);
    expect(results.feedItems).toHaveLength(0);
  });

  it('should populate reactionMap with reactor creator IDs', () => {
    const postEnv = {
      cid: btoa(String.fromCharCode(1,1,1)),
      payload: btoa(String.fromCharCode(0xFF, 1) + Constants.POST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };
    const reactionEnv = {
      cid: btoa(String.fromCharCode(3,3,3)),
      payload: btoa(String.fromCharCode(0xAA, 3) + Constants.REACTION_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const results = FeedProcessor.process([postEnv, reactionEnv], myProfile, profileMap, myCreatorIdHex);

    // targetCid from decodeReaction mock is [1,1,1] → "010101"
    const targetHex = '010101';
    expect(results.reactionMap.has(targetHex)).toBe(true);
    expect(results.reactionMap.get(targetHex)!.has('aa')).toBe(true);
  });

  it('should populate repostMap and add a repost feed item', () => {
    const postEnv = {
      cid: btoa(String.fromCharCode(1,1,1)),
      payload: btoa(String.fromCharCode(0xFF, 1) + Constants.POST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };
    const repostEnv = {
      cid: btoa(String.fromCharCode(5,5,5)),
      payload: btoa(String.fromCharCode(0xAA, 5) + Constants.REPOST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const results = FeedProcessor.process([postEnv, repostEnv], myProfile, profileMap, myCreatorIdHex);

    // originalPostCid from decodeRepost mock is [1,1,1] → "010101"
    const targetHex = '010101';
    expect(results.repostMap.has(targetHex)).toBe(true);
    expect(results.repostMap.get(targetHex)!.has('aa')).toBe(true);
    // Repost creates a feed item with repostBy set
    const repostItem = results.feedItems.find(f => f.repostBy !== undefined);
    expect(repostItem).toBeDefined();
    expect(repostItem!.repostBy!.profile.displayName).not.toBe('Me'); // from peer, not self
  });

  it('should handle mixed post+reaction+repost+reply in one batch', () => {
    const postEnv = {
      cid: btoa(String.fromCharCode(1,1,1)),
      payload: btoa(String.fromCharCode(0xFF, 1) + Constants.POST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };
    const replyEnv = {
      cid: btoa(String.fromCharCode(2,2,2)),
      payload: btoa(String.fromCharCode(0xAA, 2) + Constants.REPLY_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };
    const reactionEnv = {
      cid: btoa(String.fromCharCode(3,3,3)),
      payload: btoa(String.fromCharCode(0xAA, 3) + Constants.REACTION_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };
    const repostEnv = {
      cid: btoa(String.fromCharCode(5,5,5)),
      payload: btoa(String.fromCharCode(0xAA, 5) + Constants.REPOST_SCHEMA_URI),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };

    const results = FeedProcessor.process(
      [postEnv, replyEnv, reactionEnv, repostEnv],
      myProfile, profileMap, myCreatorIdHex
    );

    expect(results.feedItems.length).toBeGreaterThanOrEqual(1); // original post + repost copy
    expect(results.replyItems).toHaveLength(1);
    expect(results.reactionMap.size).toBe(1);
    expect(results.repostMap.size).toBe(1);
    expect(results.notifications.length).toBe(3); // reply + like + repost on my post
  });
});
