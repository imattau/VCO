import { describe, it, expect, vi } from 'vitest';
import { FeedProcessor } from '../lib/FeedProcessor';
import * as Constants from '../lib/constants';

// Mock schema decoders
vi.mock('@vco/vco-schemas', () => ({
  decodePost: vi.fn(() => ({ schema: 'vco://schemas/post/1.0.0', content: 'Stress Test Post', timestampMs: BigInt(Date.now()) })),
  decodeReply: vi.fn(() => ({ schema: 'vco://schemas/reply/1.0.0', parentCid: new Uint8Array([1,1,1]), content: 'Reply', timestampMs: BigInt(Date.now()) })),
  decodeReaction: vi.fn(() => ({ schema: 'vco://schemas/reaction/1.0.0', targetCid: new Uint8Array([1,1,1]), emoji: '❤️' })),
  decodeRepost: vi.fn(() => ({ schema: 'vco://schemas/repost/1.0.0', originalPostCid: new Uint8Array([1,1,1]), timestampMs: BigInt(Date.now()) })),
  decodeFollow: vi.fn(() => ({})),
}));

vi.mock('@vco/vco-core', () => ({
  decodeEnvelopeProto: vi.fn((bytes) => {
    // We'll use a larger buffer to store the creator ID to avoid the 255 limit
    const creatorIdByte = bytes[0];
    const creatorIdHigh = bytes[2] || 0;
    const creatorId = new Uint8Array([creatorIdByte, creatorIdHigh]);
    
    const hashByte = bytes[1] || 0;
    return {
      header: { creatorId },
      headerHash: new Uint8Array([hashByte, hashByte, hashByte]),
      payload: bytes
    };
  }),
}));

describe('Envelope Processing Stress Tests', () => {
  const myCreatorIdHex = "00";
  const myProfile: any = { displayName: "Me" };
  const profileMap = new Map();

  it('should process 5,000 mixed envelopes efficiently', () => {
    const envelopes: any[] = [];
    const count = 5000;

    for (let i = 0; i < count; i++) {
      const type = i % 4;
      let schema = "";
      if (type === 0) schema = Constants.POST_SCHEMA_URI;
      else if (type === 1) schema = Constants.REPLY_SCHEMA_URI;
      else if (type === 2) schema = Constants.REACTION_SCHEMA_URI;
      else schema = Constants.REPOST_SCHEMA_URI;

      envelopes.push({
        cid: btoa(String.fromCharCode(i % 256, i % 256, i % 256)),
        payload: btoa(String.fromCharCode(i % 256, 1, Math.floor(i / 256)) + schema), 
        channelId: Constants.GLOBAL_SOCIAL_CHANNEL
      });
    }

    const start = performance.now();
    const results = FeedProcessor.process(envelopes, myProfile, profileMap, myCreatorIdHex);
    const end = performance.now();

    console.log(`🚀 Stress Test: Processed ${count} envelopes in ${(end - start).toFixed(2)}ms`);

    expect(results.feedItems.length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(1000); 
  });

  it('should handle extreme interaction density (1000 likes on one post)', () => {
    const targetHex = "010101"; 
    
    const envelopes: any[] = [
      {
        cid: btoa(String.fromCharCode(1,1,1)),
        payload: btoa(String.fromCharCode(0xFF, 1, 0) + Constants.POST_SCHEMA_URI), 
        channelId: Constants.GLOBAL_SOCIAL_CHANNEL
      }
    ];

    for (let i = 0; i < 1000; i++) {
      envelopes.push({
        cid: btoa(`cid-${i}`),
        // Use bytes[0] and bytes[2] to encode up to 65535 unique creators
        payload: btoa(String.fromCharCode(i % 256, 1, Math.floor(i / 256)) + Constants.REACTION_SCHEMA_URI),
        channelId: Constants.GLOBAL_SOCIAL_CHANNEL
      });
    }

    const results = FeedProcessor.process(envelopes, myProfile, profileMap, myCreatorIdHex);
    
    expect(results.reactionMap.get(targetHex)?.size).toBe(1000);
  });

  it('should remain stable with empty or corrupt payloads', () => {
    const corruptEnvelopes = [
      { cid: "abc", payload: "not-base64!!", channelId: "test" },
      { cid: "def", payload: btoa("short"), channelId: Constants.GLOBAL_SOCIAL_CHANNEL }
    ];

    expect(() => {
      FeedProcessor.process(corruptEnvelopes, myProfile, profileMap, myCreatorIdHex);
    }).not.toThrow();
  });
});
