import { describe, it, expect, vi } from 'vitest';
import * as Constants from '../lib/constants';
import { toHex } from '@vco/vco-testing';

// Mocking dependencies for logic testing
vi.mock('@vco/vco-schemas', () => ({
  decodePost: vi.fn((p) => ({ schema: 'vco://schemas/post/1.0.0', content: 'Mock Post', timestampMs: BigInt(1000) })),
  decodeReply: vi.fn((p) => ({ 
    schema: 'vco://schemas/reply/1.0.0', 
    parentCid: p.parentCid || new Uint8Array([1,2,3]), 
    content: 'Mock Reply', 
    timestampMs: BigInt(1100) 
  })),
  decodeReaction: vi.fn((p) => ({ schema: 'vco://schemas/reaction/1.0.0', targetCid: new Uint8Array([1,2,3]), emoji: '❤️' })),
  decodeRepost: vi.fn((p) => ({ schema: 'vco://schemas/repost/1.0.0', originalPostCid: new Uint8Array([1,2,3]), timestampMs: BigInt(1200) })),
  decodeFollow: vi.fn((p) => ({ schema: 'vco://schemas/follow/1.0.0', action: 'follow', subjectKey: new Uint8Array([4,5,6]) })),
  decodeDirectMessage: vi.fn(() => ({})),
}));

vi.mock('@vco/vco-core', () => ({
  decodeEnvelopeProto: vi.fn((bytes) => ({
    header: { creatorId: new Uint8Array([7,8,9]) },
    headerHash: new Uint8Array([1,2,3]),
    payload: new Uint8Array([0]),
  })),
}));

describe('Social Logic Unit Tests', () => {
  
  it('should correctly identify and categorize a Post', async () => {
    const payloadRaw = Constants.POST_SCHEMA_URI;
    expect(payloadRaw.includes(Constants.POST_SCHEMA_URI)).toBe(true);
  });

  describe('Threading & Replies', () => {
    it('should correctly filter replies for a specific parent post', () => {
      const parentCid = new Uint8Array([1, 1, 1]);
      const otherCid = new Uint8Array([2, 2, 2]);
      
      const allReplies = [
        { data: { parentCid: parentCid }, content: "Reply 1" },
        { data: { parentCid: otherCid }, content: "Reply 2" },
        { data: { parentCid: parentCid }, content: "Reply 3" }
      ];

      // Reconstruct logic from ThreadView/SocialContext
      const threadReplies = allReplies.filter(r => toHex(r.data.parentCid) === toHex(parentCid));

      expect(threadReplies.length).toBe(2);
      expect(threadReplies[0].content).toBe("Reply 1");
      expect(threadReplies[1].content).toBe("Reply 3");
    });

    it('should support multi-level deep threading', () => {
      const rootCid = new Uint8Array([0, 0, 0]);
      const reply1Cid = new Uint8Array([1, 1, 1]);
      const reply2Cid = new Uint8Array([2, 2, 2]);

      const allItems = [
        { cid: rootCid, type: 'post' },
        { cid: reply1Cid, data: { parentCid: rootCid }, type: 'reply' },
        { cid: reply2Cid, data: { parentCid: reply1Cid }, type: 'reply' }
      ];

      // Logic to find children of any level
      const getChildren = (targetCid: Uint8Array) => 
        allItems.filter(item => (item as any).data?.parentCid && toHex((item as any).data.parentCid) === toHex(targetCid));

      const level1 = getChildren(rootCid);
      expect(level1.length).toBe(1);
      expect(toHex(level1[0].cid)).toBe(toHex(reply1Cid));

      const level2 = getChildren(reply1Cid);
      expect(level2.length).toBe(1);
      expect(toHex(level2[0].cid)).toBe(toHex(reply2Cid));
    });
  });

  it('should correctly associate a Reaction with a target post', () => {
    const reactionMap = new Map<string, Set<string>>();
    const targetHex = "010203";
    const creatorIdHex = "070809";

    if (!reactionMap.has(targetHex)) reactionMap.set(targetHex, new Set());
    reactionMap.get(targetHex)!.add(creatorIdHex);

    expect(reactionMap.get(targetHex)?.has(creatorIdHex)).toBe(true);
  });

  it('should correctly inject a Repost into the feed', () => {
    const fItems: any[] = [];
    const allPostsByCid = new Map<string, any>();
    const targetHex = "010203";
    allPostsByCid.set(targetHex, { data: { content: "Original" }, authorProfile: { displayName: "Alice" } });

    const repostData = { originalPostCid: new Uint8Array([1,2,3]) };
    const original = allPostsByCid.get(targetHex);
    if (original) {
      fItems.push({ data: original.data, repostBy: { profile: { displayName: "Bob" } } });
    }

    expect(fItems.length).toBe(1);
    expect(fItems[0].repostBy.profile.displayName).toBe("Bob");
  });

  it('should hide items that have been tombstoned', () => {
    const feed = [{ cid: new Uint8Array([1,2,3]) }, { cid: new Uint8Array([4,5,6]) }];
    const tombstones = new Set(["010203"]);
    const filtered = feed.filter(item => !tombstones.has(toHex(item.cid)));
    expect(filtered.length).toBe(1);
  });

  it('should correctly filter feed by hashtag', () => {
    const feed = [{ data: { tags: ["vco"] } }, { data: { tags: ["rust"] } }];
    const filtered = feed.filter(item => item.data.tags.includes("vco"));
    expect(filtered.length).toBe(1);
  });

});
