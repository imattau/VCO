import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedProcessor } from '../lib/FeedProcessor';
import * as Constants from '../lib/constants';
import { setPlatform } from '../lib/platform';
import { MockPlatform } from './PlatformTestUtils';
import { 
  createNobleCryptoProvider, 
  deriveEd25519Multikey, 
} from '@vco/vco-crypto';
import { 
  createEnvelope, 
  encodeEnvelopeProto,
  MULTICODEC_PROTOBUF
} from '@vco/vco-core';
import { 
  encodePost, 
  encodeReply,
  encodeReaction,
  encodeRepost
} from '@vco/vco-schemas';
import { toHex, fromHex } from '../lib/encoding';

const crypto = createNobleCryptoProvider();

function seedPrivKey(seed: number): Uint8Array {
  const k = new Uint8Array(32);
  k[0] = seed % 256;
  k[1] = Math.floor(seed / 256) % 256;
  k[2] = Math.floor(seed / 65536) % 256;
  return k;
}

describe('Envelope Processing Stress Tests (Platform Abstracted)', () => {
  let mockPlatform: MockPlatform;
  const myPriv = seedPrivKey(0);
  const myCreatorId = deriveEd25519Multikey(myPriv);
  const myCreatorIdHex = toHex(myCreatorId);
  const myProfile: any = { displayName: "Me" };
  const profileMap = new Map();
  const followingSet = new Set<string>();

  beforeEach(() => {
    mockPlatform = new MockPlatform();
    setPlatform(mockPlatform);
    vi.clearAllMocks();
  });

  async function makeStoreItem(payload: Uint8Array, priv: Uint8Array) {
    const creatorId = deriveEd25519Multikey(priv);
    const env = await createEnvelope({
      payload,
      payloadType: MULTICODEC_PROTOBUF,
      creatorId,
      privateKey: priv
    }, crypto);
    const wire = encodeEnvelopeProto(env);
    let binary = '';
    for (let i = 0; i < wire.byteLength; i++) {
      binary += String.fromCharCode(wire[i]);
    }
    return {
      cid: toHex(env.headerHash),
      payload: btoa(binary),
      channelId: Constants.GLOBAL_SOCIAL_CHANNEL
    };
  }

  it('should process 1,000 mixed envelopes efficiently', async () => {
    const count = 1000;
    const items: any[] = [];

    // Pre-generate some posts to resolve against
    const postPriv = seedPrivKey(1);
    const postPayload = encodePost({ schema: Constants.POST_SCHEMA_URI, content: "Target", timestamp: BigInt(Date.now()), mediaCids: [] });
    const postItem = await makeStoreItem(postPayload, postPriv);
    const postCid = postItem.cid;
    items.push(postItem);

    for (let i = 0; i < count; i++) {
      const type = i % 3;
      const priv = seedPrivKey(i + 10);
      let payload: Uint8Array;
      
      if (type === 0) {
        payload = encodePost({ schema: Constants.POST_SCHEMA_URI, content: `Post ${i}`, timestamp: BigInt(Date.now()), mediaCids: [] });
      } else if (type === 1) {
        payload = encodeReply({ schema: Constants.REPLY_SCHEMA_URI, content: "Reply", parentCid: fromHex(postCid), timestamp: BigInt(Date.now()) });
      } else {
        payload = encodeReaction({ schema: Constants.REACTION_SCHEMA_URI, targetCid: fromHex(postCid), emoji: "❤️", timestampMs: BigInt(Date.now()) });
      }
      items.push(await makeStoreItem(payload, priv));
    }

    const start = performance.now();
    const results = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex);
    const end = performance.now();

    console.log(`🚀 Stress Test: Processed ${items.length} envelopes in ${(end - start).toFixed(2)}ms`);

    expect(results.feedItems.length).toBeGreaterThan(0);
    expect(results.reactionMap.size).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(1000); 
  });

  it('should handle interaction density (500 likes on one post)', async () => {
    const postPriv = seedPrivKey(1);
    const postPayload = encodePost({ schema: Constants.POST_SCHEMA_URI, content: "Hot Post", timestamp: BigInt(Date.now()), mediaCids: [] });
    const postItem = await makeStoreItem(postPayload, postPriv);
    const postCid = postItem.cid;
    
    const items: any[] = [postItem];

    for (let i = 0; i < 500; i++) {
      const priv = seedPrivKey(i + 100);
      const reactionPayload = encodeReaction({ schema: Constants.REACTION_SCHEMA_URI, targetCid: fromHex(postCid), emoji: "👍", timestampMs: BigInt(Date.now()) });
      items.push(await makeStoreItem(reactionPayload, priv));
    }

    const results = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex);
    
    expect(results.reactionMap.get(postCid)?.size).toBe(500);
  });

  it('should remain stable with empty or corrupt payloads', () => {
    const corruptEnvelopes = [
      { cid: "abc", payload: "not-base64!!", channelId: "test" },
      { cid: "def", payload: btoa("short"), channelId: Constants.GLOBAL_SOCIAL_CHANNEL }
    ];

    expect(() => {
      FeedProcessor.process(corruptEnvelopes, myProfile, profileMap, followingSet, myCreatorIdHex);
    }).not.toThrow();
  });
});
