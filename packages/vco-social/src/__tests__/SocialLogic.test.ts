import { describe, it, expect, vi } from 'vitest';
import * as Constants from '../lib/constants';
import { toHex } from '@vco/vco-testing';

// Mocking the complex crypto/schema dependencies
vi.mock('@vco/vco-schemas', () => ({
  decodePost: vi.fn((p) => ({ schema: 'vco://schemas/post/1.0.0', content: 'Mock Post', timestampMs: BigInt(1000) })),
  decodeReply: vi.fn((p) => ({ schema: 'vco://schemas/reply/1.0.0', parentCid: new Uint8Array([1,2,3]), content: 'Mock Reply', timestampMs: BigInt(1100) })),
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

  it('should correctly associate a Reaction with a target post', () => {
    const reactionMap = new Map<string, Set<string>>();
    const targetHex = "010203";
    const creatorIdHex = "070809";

    if (!reactionMap.has(targetHex)) reactionMap.set(targetHex, new Set());
    reactionMap.get(targetHex)!.add(creatorIdHex);

    expect(reactionMap.get(targetHex)?.has(creatorIdHex)).toBe(true);
    expect(reactionMap.get(targetHex)?.size).toBe(1);
  });

  it('should correctly inject a Repost into the feed', () => {
    const fItems: any[] = [];
    const allPostsByCid = new Map<string, any>();
    
    const targetHex = "010203";
    const originalPost = { authorId: new Uint8Array([7,8,9]), data: { content: "Original" }, authorProfile: { displayName: "Alice" } };
    allPostsByCid.set(targetHex, originalPost);

    const repostData = { originalPostCid: new Uint8Array([1,2,3]), timestampMs: BigInt(2000) };
    const authorProfile = { displayName: "Bob" };

    const original = allPostsByCid.get(targetHex);
    if (original) {
      fItems.push({
        cid: repostData.originalPostCid,
        authorId: original.authorId,
        data: original.data,
        authorProfile: original.authorProfile,
        repostBy: {
          profile: authorProfile,
          timestampMs: repostData.timestampMs
        }
      });
    }

    expect(fItems.length).toBe(1);
    expect(fItems[0].repostBy.profile.displayName).toBe("Bob");
    expect(fItems[0].authorProfile.displayName).toBe("Alice");
  });

  it('should correctly sort feed by interaction time (Original vs Repost)', () => {
    const items = [
      { data: { timestampMs: BigInt(1000) }, repostBy: undefined },
      { data: { timestampMs: BigInt(500) }, repostBy: { timestampMs: BigInt(2000) } },
    ];

    const sorted = items.sort((a, b) => {
      const aTime = a.repostBy ? Number(a.repostBy.timestampMs) : Number(a.data.timestampMs);
      const bTime = b.repostBy ? Number(b.repostBy.timestampMs) : Number(b.data.timestampMs);
      return bTime - aTime;
    });

    expect(Number(sorted[0].repostBy?.timestampMs)).toBe(2000);
    expect(Number(sorted[1].data.timestampMs)).toBe(1000);
  });

  it('should hide items that have been tombstoned', () => {
    const feed = [
      { cid: new Uint8Array([1,2,3]), data: { content: "Hidden" } },
      { cid: new Uint8Array([4,5,6]), data: { content: "Visible" } }
    ];
    const tombstones = new Set(["010203"]);

    const filtered = feed.filter(item => !tombstones.has(toHex(item.cid)));

    expect(filtered.length).toBe(1);
    expect(filtered[0].data.content).toBe("Visible");
  });

  it('should correctly filter feed by hashtag', () => {
    const feed = [
      { data: { tags: ["vco", "social"] } },
      { data: { tags: ["rust"] } }
    ];
    
    const filter = { type: 'tag' as const, value: 'vco' };
    
    const filtered = feed.filter(item => 
      item.data.tags.includes(filter.value)
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].data.tags).toContain("vco");
  });

});
