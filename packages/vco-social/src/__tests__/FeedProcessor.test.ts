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
import { toHex } from '../lib/encoding';

const crypto = createNobleCryptoProvider();

function seedPrivKey(seed: number): Uint8Array {
  const k = new Uint8Array(32);
  k.fill(seed);
  return k;
}

describe('FeedProcessor Integration Tests (Platform Abstracted)', () => {
  let mockPlatform: MockPlatform;
  const myPriv = seedPrivKey(1);
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

  async function makeStoreItem(env: any) {
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

  it('should generate a notification when someone replies to my post', async () => {
    const postEnv = await createEnvelope({
      payload: encodePost({ schema: Constants.POST_SCHEMA_URI, content: "My post", timestamp: BigInt(Date.now()), mediaCids: [] }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: myCreatorId,
      privateKey: myPriv
    }, crypto);

    const peerPriv = seedPrivKey(2);
    const peerId = deriveEd25519Multikey(peerPriv);
    const replyEnv = await createEnvelope({
      payload: encodeReply({ schema: Constants.REPLY_SCHEMA_URI, content: "Reply", parentCid: postEnv.headerHash, timestamp: BigInt(Date.now()) }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: peerId,
      privateKey: peerPriv
    }, crypto);

    const items = [await makeStoreItem(postEnv), await makeStoreItem(replyEnv)];
    
    // Two-pass simulation
    const res1 = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex);
    const extraPosts = new Map();
    res1.feedItems.forEach(fi => extraPosts.set(toHex(fi.cid), { authorId: fi.authorId, data: fi.data, authorProfile: fi.authorProfile }));

    const { notifications } = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex, extraPosts);

    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe(1); // Reply
  });

  it('should generate a notification when someone likes my post', async () => {
    const postEnv = await createEnvelope({
      payload: encodePost({ schema: Constants.POST_SCHEMA_URI, content: "My post", timestamp: BigInt(Date.now()), mediaCids: [] }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: myCreatorId,
      privateKey: myPriv
    }, crypto);

    const peerPriv = seedPrivKey(2);
    const peerId = deriveEd25519Multikey(peerPriv);
    const reactionEnv = await createEnvelope({
      payload: encodeReaction({ schema: Constants.REACTION_SCHEMA_URI, targetCid: postEnv.headerHash, emoji: "❤️", timestampMs: BigInt(Date.now()) }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: peerId,
      privateKey: peerPriv
    }, crypto);

    const items = [await makeStoreItem(postEnv), await makeStoreItem(reactionEnv)];
    
    const res1 = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex);
    const extraPosts = new Map();
    res1.feedItems.forEach(fi => extraPosts.set(toHex(fi.cid), { authorId: fi.authorId, data: fi.data, authorProfile: fi.authorProfile }));

    const { notifications } = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex, extraPosts);

    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe(3); // Reaction
  });

  it('should populate reactionMap and repostMap', async () => {
    const postEnv = await createEnvelope({
      payload: encodePost({ schema: Constants.POST_SCHEMA_URI, content: "Post", timestamp: BigInt(Date.now()), mediaCids: [] }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: myCreatorId,
      privateKey: myPriv
    }, crypto);

    const peerPriv = seedPrivKey(2);
    const peerId = deriveEd25519Multikey(peerPriv);
    const peerIdHex = toHex(peerId);
    
    const reactionEnv = await createEnvelope({
      payload: encodeReaction({ schema: Constants.REACTION_SCHEMA_URI, targetCid: postEnv.headerHash, emoji: "🔥", timestampMs: BigInt(Date.now()) }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: peerId,
      privateKey: peerPriv
    }, crypto);

    const repostEnv = await createEnvelope({
      payload: encodeRepost({ schema: Constants.REPOST_SCHEMA_URI, originalPostCid: postEnv.headerHash, originalAuthorCid: myCreatorId, timestampMs: BigInt(Date.now()) }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: peerId,
      privateKey: peerPriv
    }, crypto);

    const items = [await makeStoreItem(postEnv), await makeStoreItem(reactionEnv), await makeStoreItem(repostEnv)];
    const { reactionMap, repostMap, feedItems } = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex);

    const postHex = toHex(postEnv.headerHash);
    expect(reactionMap.get(postHex)?.has(peerIdHex)).toBe(true);
    expect(repostMap.get(postHex)?.has(peerIdHex)).toBe(true);
    expect(feedItems.length).toBeGreaterThanOrEqual(1);
  });
});
