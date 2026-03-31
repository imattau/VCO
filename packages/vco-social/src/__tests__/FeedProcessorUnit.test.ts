// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedProcessor, type ProcessedResults } from '../lib/FeedProcessor';
import { toHex } from '../lib/encoding';
import * as Constants from '../lib/constants';

// ─── Real crypto stack ────────────────────────────────────────────────────────
import { NobleCryptoProvider, deriveEd25519Multikey } from '@vco/vco-crypto';
import { createEnvelope, encodeEnvelopeProto } from '@vco/vco-core';
import {
  encodePost,
  encodeReply,
  encodeReaction,
  encodeRepost,
} from '@vco/vco-schemas';
import type { ProfileData } from '@vco/vco-schemas';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const crypto = new NobleCryptoProvider();

/** Build a deterministic 32-byte private key from a small seed byte. */
function makePrivateKey(seed: number): Uint8Array {
  const k = new Uint8Array(32);
  k.fill(seed);
  return k;
}

/** Encode a fully-signed VCO envelope and return it as a base64 string suitable
 *  for use as the `payload` field in a FeedProcessor store item. */
function envelopeToBase64(
  payloadBytes: Uint8Array,
  privateKey: Uint8Array,
): string {
  const creatorId = deriveEd25519Multikey(privateKey);
  const envelope = createEnvelope(
    { payload: payloadBytes, payloadType: 0x50, creatorId, privateKey },
    crypto,
  );
  const wire = encodeEnvelopeProto(envelope);
  // FeedProcessor does: Uint8Array.from(atob(e.payload), c => c.charCodeAt(0))
  return btoa(String.fromCharCode(...wire));
}

/** Build a minimal store item in the shape FeedProcessor.process() expects. */
function makeStoreItem(
  payloadBase64: string,
  cidHex: string,
  channelId = Constants.GLOBAL_SOCIAL_CHANNEL,
): any {
  return { payload: payloadBase64, cid: cidHex, channelId };
}

/** A throw-away ProfileData for test authors. */
function makeProfile(name: string): ProfileData {
  return {
    schema: Constants.PROFILE_SCHEMA_URI,
    displayName: name,
    avatarCid: new Uint8Array(0),
    previousManifest: new Uint8Array(0),
    bio: '',
  };
}

// ─── Shared keys / identities ─────────────────────────────────────────────────

const myPrivateKey = makePrivateKey(0x01);
const myCreatorId = deriveEd25519Multikey(myPrivateKey);
const myCreatorIdHex = toHex(myCreatorId);
const myProfile = makeProfile('Alice');

const peerPrivateKey = makePrivateKey(0x02);
const peerCreatorId = deriveEd25519Multikey(peerPrivateKey);
const peerCreatorIdHex = toHex(peerCreatorId);
const peerProfile = makeProfile('Bob');

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('FeedProcessor.process()', () => {
  let profileMap: Map<string, ProfileData>;

  beforeEach(() => {
    profileMap = new Map([[peerCreatorIdHex, peerProfile]]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 1. Post envelope ─────────────────────────────────────────────────────

  describe('post envelope', () => {
    it('appears as a feedItem with correct author and content', () => {
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'Hello world',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const payload = envelopeToBase64(postBytes, myPrivateKey);

      // We need the envelope's headerHash as the cid. Reconstruct it.
      const creatorId = myCreatorId;
      const envelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId, privateKey: myPrivateKey },
        crypto,
      );
      const cidHex = toHex(envelope.headerHash);
      const item = makeStoreItem(payload, cidHex);

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [item],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      expect(result.feedItems).toHaveLength(1);
      const fi = result.feedItems[0];
      expect(fi.data.content).toBe('Hello world');
      expect(toHex(fi.authorId)).toBe(myCreatorIdHex);
      expect(fi.authorProfile.displayName).toBe('Alice');
      expect(fi.repostBy).toBeUndefined();
    });

    it('uses placeholder profile for unknown peer author', () => {
      const unknownKey = makePrivateKey(0x99);
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'From stranger',
        mediaCids: [],
        timestampMs: BigInt(2_000),
      });
      const payload = envelopeToBase64(postBytes, unknownKey);
      const unknownCreatorId = deriveEd25519Multikey(unknownKey);
      const envelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: unknownCreatorId, privateKey: unknownKey },
        crypto,
      );
      const cidHex = toHex(envelope.headerHash);
      const item = makeStoreItem(payload, cidHex);

      const followingSet = new Set<string>();
      const result = FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);

      expect(result.feedItems).toHaveLength(1);
      const profile = result.feedItems[0].authorProfile;
      // placeholder displayName starts with 'User ' followed by first 6 hex chars
      expect(profile.displayName).toMatch(/^User [0-9a-f]{6}/);
      expect(profile.bio).toBe('Offline identity');
    });
  });

  // ── 2. Reply envelope with valid parent CID ───────────────────────────────

  describe('reply envelope', () => {
    it('appears as a replyItem linked to its parent when parent is in the batch', () => {
      // First build the parent post envelope so Pass 1 populates allPostsByCid.
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'Parent post',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const postEnvelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const parentCid = postEnvelope.headerHash;
      const postPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(postEnvelope)));
      const postItem = makeStoreItem(postPayload, toHex(parentCid));

      // Now build a reply referencing that parent.
      const replyBytes = encodeReply({
        schema: Constants.REPLY_SCHEMA_URI,
        parentCid,
        content: 'Nice post!',
        mediaCids: [],
        timestampMs: BigInt(2_000),
      });
      const replyEnvelope = createEnvelope(
        { payload: replyBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const replyPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(replyEnvelope)));
      const replyItem = makeStoreItem(replyPayload, toHex(replyEnvelope.headerHash));

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [replyItem, postItem],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      expect(result.replyItems).toHaveLength(1);
      const ri = result.replyItems[0];
      expect(ri.data.content).toBe('Nice post!');
      expect(toHex(ri.data.parentCid)).toBe(toHex(parentCid));
      expect(toHex(ri.authorId)).toBe(peerCreatorIdHex);
    });

    it('generates a notification when someone replies to my post', () => {
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'My post',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const postEnvelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const parentCid = postEnvelope.headerHash;
      const postPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(postEnvelope)));

      const replyBytes = encodeReply({
        schema: Constants.REPLY_SCHEMA_URI,
        parentCid,
        content: 'Hello back',
        mediaCids: [],
        timestampMs: BigInt(3_000),
      });
      const replyEnvelope = createEnvelope(
        { payload: replyBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const replyPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(replyEnvelope)));

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [
          makeStoreItem(postPayload, toHex(parentCid)),
          makeStoreItem(replyPayload, toHex(replyEnvelope.headerHash)),
        ],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe(1); // Reply notification type
    });
  });

  // ── 3. Reply envelope with unknown parent CID ─────────────────────────────

  describe('reply with unknown parent CID', () => {
    it('is still added to replyItems and does not throw', () => {
      const unknownParentCid = new Uint8Array(32).fill(0xde);
      const replyBytes = encodeReply({
        schema: Constants.REPLY_SCHEMA_URI,
        parentCid: unknownParentCid,
        content: 'Orphan reply',
        mediaCids: [],
        timestampMs: BigInt(4_000),
      });
      const replyEnvelope = createEnvelope(
        { payload: replyBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const replyPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(replyEnvelope)));
      const item = makeStoreItem(replyPayload, toHex(replyEnvelope.headerHash));

      let result!: ProcessedResults;
      expect(() => {
      const followingSet = new Set<string>();
      result = FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);
      }).not.toThrow();

      // The reply is still emitted; parent-link notification is simply absent.
      expect(result.replyItems).toHaveLength(1);
      expect(result.replyItems[0].data.content).toBe('Orphan reply');
      expect(result.notifications).toHaveLength(0);
    });

    it('emits a debug log for the unknown parent CID', () => {
      const unknownParentCid = new Uint8Array(32).fill(0xab);
      const replyBytes = encodeReply({
        schema: Constants.REPLY_SCHEMA_URI,
        parentCid: unknownParentCid,
        content: 'Dangling reply',
        mediaCids: [],
        timestampMs: BigInt(5_000),
      });
      const replyEnvelope = createEnvelope(
        { payload: replyBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const replyPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(replyEnvelope)));
      const item = makeStoreItem(replyPayload, toHex(replyEnvelope.headerHash));

      const followingSet = new Set<string>();
      FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('FeedProcessor: reply references unknown parent CID'),
        expect.any(String),
      );
    });
  });

  // ── 4. Reaction envelope ──────────────────────────────────────────────────

  describe('reaction envelope', () => {
    it('appears in reactionMap keyed by target post CID', () => {
      // Build a target post so it exists in allPostsByCid.
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'Likeable post',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const postEnvelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const targetCid = postEnvelope.headerHash;
      const postPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(postEnvelope)));

      const reactionBytes = encodeReaction({
        schema: Constants.REACTION_SCHEMA_URI,
        targetCid,
        emoji: '❤️',
        timestampMs: BigInt(6_000),
      });
      const reactionEnvelope = createEnvelope(
        { payload: reactionBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const reactionPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(reactionEnvelope)));

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [
          makeStoreItem(postPayload, toHex(targetCid)),
          makeStoreItem(reactionPayload, toHex(reactionEnvelope.headerHash)),
        ],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      const targetHex = toHex(targetCid);
      expect(result.reactionMap.has(targetHex)).toBe(true);
      expect(result.reactionMap.get(targetHex)!.has(peerCreatorIdHex)).toBe(true);
    });

    it('generates a notification when peer reacts to my post', () => {
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'My likeable post',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const postEnvelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const targetCid = postEnvelope.headerHash;
      const postPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(postEnvelope)));

      const reactionBytes = encodeReaction({
        schema: Constants.REACTION_SCHEMA_URI,
        targetCid,
        emoji: '👍',
        timestampMs: BigInt(7_000),
      });
      const reactionEnvelope = createEnvelope(
        { payload: reactionBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const reactionPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(reactionEnvelope)));

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [
          makeStoreItem(postPayload, toHex(targetCid)),
          makeStoreItem(reactionPayload, toHex(reactionEnvelope.headerHash)),
        ],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe(3); // Reaction notification type
      expect(result.notifications[0].content).toBe('liked your post');
    });
  });

  // ── 5. Reaction with unknown target ──────────────────────────────────────

  describe('reaction with unknown target CID', () => {
    it('still records in reactionMap but emits no notification and no crash', () => {
      const unknownTargetCid = new Uint8Array(32).fill(0xcc);
      const reactionBytes = encodeReaction({
        schema: Constants.REACTION_SCHEMA_URI,
        targetCid: unknownTargetCid,
        emoji: '🔥',
        timestampMs: BigInt(8_000),
      });
      const reactionEnvelope = createEnvelope(
        { payload: reactionBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const reactionPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(reactionEnvelope)));
      const item = makeStoreItem(reactionPayload, toHex(reactionEnvelope.headerHash));

      let result!: ProcessedResults;
      expect(() => {
      const followingSet = new Set<string>();
      result = FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);
      }).not.toThrow();

      const targetHex = toHex(unknownTargetCid);
      expect(result.reactionMap.has(targetHex)).toBe(true);
      expect(result.reactionMap.get(targetHex)!.has(peerCreatorIdHex)).toBe(true);
      expect(result.notifications).toHaveLength(0);
    });

    it('emits a debug log for the unknown reaction target', () => {
      const unknownTargetCid = new Uint8Array(32).fill(0x77);
      const reactionBytes = encodeReaction({
        schema: Constants.REACTION_SCHEMA_URI,
        targetCid: unknownTargetCid,
        emoji: '✨',
        timestampMs: BigInt(9_000),
      });
      const reactionEnvelope = createEnvelope(
        { payload: reactionBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const reactionPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(reactionEnvelope)));

      const followingSet = new Set<string>();
      FeedProcessor.process(
        [makeStoreItem(reactionPayload, toHex(reactionEnvelope.headerHash))],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('FeedProcessor: reaction references unknown target CID'),
        expect.any(String),
      );
    });
  });

  // ── 6. Repost envelope ────────────────────────────────────────────────────

  describe('repost envelope', () => {
    it('injects the original post into feedItems with repostBy metadata', () => {
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'Original content',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const postEnvelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const originalPostCid = postEnvelope.headerHash;
      const postPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(postEnvelope)));

      const repostBytes = encodeRepost({
        schema: Constants.REPOST_SCHEMA_URI,
        originalPostCid,
        originalAuthorCid: myCreatorId,
        commentary: '',
        timestampMs: BigInt(10_000),
      });
      const repostEnvelope = createEnvelope(
        { payload: repostBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const repostPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(repostEnvelope)));

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [
          makeStoreItem(postPayload, toHex(originalPostCid)),
          makeStoreItem(repostPayload, toHex(repostEnvelope.headerHash)),
        ],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      // feedItems has both: the original post item AND the repost-injected copy.
      const repostedItem = result.feedItems.find(fi => fi.repostBy !== undefined);
      expect(repostedItem).toBeDefined();
      expect(repostedItem!.data.content).toBe('Original content');
      expect(toHex(repostedItem!.authorId)).toBe(myCreatorIdHex);
      expect(repostedItem!.repostBy!.profile.displayName).toBe('Bob');

      // repostMap entry
      const targetHex = toHex(originalPostCid);
      expect(result.repostMap.has(targetHex)).toBe(true);
      expect(result.repostMap.get(targetHex)!.has(peerCreatorIdHex)).toBe(true);
    });

    it('generates a notification when peer reposts my post', () => {
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'My original',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const postEnvelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const originalPostCid = postEnvelope.headerHash;
      const postPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(postEnvelope)));

      const repostBytes = encodeRepost({
        schema: Constants.REPOST_SCHEMA_URI,
        originalPostCid,
        originalAuthorCid: myCreatorId,
        commentary: '',
        timestampMs: BigInt(11_000),
      });
      const repostEnvelope = createEnvelope(
        { payload: repostBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const repostPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(repostEnvelope)));

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [
          makeStoreItem(postPayload, toHex(originalPostCid)),
          makeStoreItem(repostPayload, toHex(repostEnvelope.headerHash)),
        ],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
      );

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe(2); // Repost notification type
    });
  });

  // ── 7. Malformed envelope payload ─────────────────────────────────────────

  describe('malformed envelope payload', () => {
    it('skips the item without throwing when base64 decodes to non-protobuf garbage', () => {
      // A valid base64 string that is not a valid protobuf envelope.
      const garbled = btoa('this is not a valid protobuf envelope at all!');
      const item = makeStoreItem(garbled, 'deadbeef');

      let result!: ProcessedResults;
      expect(() => {
      const followingSet = new Set<string>();
      result = FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);
      }).not.toThrow();

      expect(result.feedItems).toHaveLength(0);
      expect(result.replyItems).toHaveLength(0);
    });

    it('logs a console.warn for each malformed item', () => {
      const garbled = btoa('bad protobuf bytes here');
      const item = makeStoreItem(garbled, 'baadf00d');

      const followingSet = new Set<string>();
      FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('FeedProcessor: failed to process item'),
        expect.anything(),
      );
    });

    it('skips an item whose inner schema payload is corrupted but envelope is valid', () => {
      // Encode an envelope whose payload bytes are random garbage (not a valid schema message).
      const badPayload = new Uint8Array(32).fill(0xff);
      const creatorId = deriveEd25519Multikey(peerPrivateKey);
      const envelope = createEnvelope(
        { payload: badPayload, payloadType: 0x50, creatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const wire = encodeEnvelopeProto(envelope);
      // The payload raw text won't match any schema URI, so it is simply ignored (not crash).
      const payloadB64 = btoa(String.fromCharCode(...wire));
      const item = makeStoreItem(payloadB64, toHex(envelope.headerHash));

      let result!: ProcessedResults;
      expect(() => {
      const followingSet = new Set<string>();
      result = FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);
      }).not.toThrow();

      expect(result.feedItems).toHaveLength(0);
      expect(result.replyItems).toHaveLength(0);
    });
  });

  // ── 8. Empty batch ────────────────────────────────────────────────────────

  describe('empty batch', () => {
    it('returns an empty ProcessedResults without crashing', () => {
      const followingSet = new Set<string>();
      const result = FeedProcessor.process([], myProfile, profileMap, followingSet, myCreatorIdHex);
      expect(result.feedItems).toHaveLength(0);
      expect(result.replyItems).toHaveLength(0);
      expect(result.followSet.size).toBe(0);
      expect(result.reactionMap.size).toBe(0);
      expect(result.repostMap.size).toBe(0);
      expect(result.notifications).toHaveLength(0);
    });
  });

  // ── 9. Mixed valid / invalid batch ───────────────────────────────────────

  describe('mixed valid and invalid batch', () => {
    it('returns valid items and skips invalid ones', () => {
      // Valid post envelope
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'Valid post in mixed batch',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const postEnvelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const validPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(postEnvelope)));
      const validItem = makeStoreItem(validPayload, toHex(postEnvelope.headerHash));

      // Invalid item 1: completely corrupt payload
      const invalidItem1 = makeStoreItem(btoa('not an envelope'), 'badbad01');

      // Invalid item 2: empty string payload
      const invalidItem2 = makeStoreItem('', 'badbad02');

      // Invalid item 3: valid base64 but random bytes (invalid protobuf)
      const randomBytes = new Uint8Array(64);
      randomBytes.fill(0x55);
      const invalidItem3 = makeStoreItem(btoa(String.fromCharCode(...randomBytes)), 'badbad03');

      const result = FeedProcessor.process(
        [invalidItem1, validItem, invalidItem2, invalidItem3],
        myProfile,
        profileMap,
        myCreatorIdHex,
      );

      expect(result.feedItems).toHaveLength(1);
      expect(result.feedItems[0].data.content).toBe('Valid post in mixed batch');
    });

    it('accumulates multiple valid items from the same batch', () => {
      const makePost = (content: string, seed: number) => {
        const key = makePrivateKey(seed);
        const cid = deriveEd25519Multikey(key);
        const bytes = encodePost({
          schema: Constants.POST_SCHEMA_URI,
          content,
          mediaCids: [],
          timestampMs: BigInt(seed * 1_000),
        });
        const env = createEnvelope(
          { payload: bytes, payloadType: 0x50, creatorId: cid, privateKey: key },
          crypto,
        );
        const b64 = btoa(String.fromCharCode(...encodeEnvelopeProto(env)));
        return makeStoreItem(b64, toHex(env.headerHash));
      };

      const items = [
        makePost('Post A', 0x10),
        makePost('Post B', 0x11),
        makePost('Post C', 0x12),
      ];

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(items, myProfile, profileMap, followingSet, myCreatorIdHex);

      expect(result.feedItems).toHaveLength(3);
      const contents = result.feedItems.map(fi => fi.data.content).sort();
      expect(contents).toEqual(['Post A', 'Post B', 'Post C']);
    });
  });

  // ── 10. channelId gating ─────────────────────────────────────────────────

  describe('channelId gating', () => {
    it('ignores envelopes not on GLOBAL_SOCIAL_CHANNEL', () => {
      const postBytes = encodePost({
        schema: Constants.POST_SCHEMA_URI,
        content: 'Wrong channel',
        mediaCids: [],
        timestampMs: BigInt(1_000),
      });
      const envelope = createEnvelope(
        { payload: postBytes, payloadType: 0x50, creatorId: myCreatorId, privateKey: myPrivateKey },
        crypto,
      );
      const b64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      // Use a different channelId
      const item = makeStoreItem(b64, toHex(envelope.headerHash), 'vco://channels/other/channel');

      const followingSet = new Set<string>();
      const result = FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);

      expect(result.feedItems).toHaveLength(0);
    });
  });

  // ── 11. extraPostsByCid seed ──────────────────────────────────────────────

  describe('extraPostsByCid', () => {
    it('uses posts from extraPostsByCid to resolve reply parents from prior sessions', () => {
      const priorPostCid = new Uint8Array(32).fill(0x42);
      const priorPostCidHex = toHex(priorPostCid);
      const extraPosts = new Map([
        [
          priorPostCidHex,
          {
            authorId: myCreatorId,
            data: {
              schema: Constants.POST_SCHEMA_URI,
              content: 'Post from prior session',
              mediaCids: [],
              timestampMs: BigInt(500),
            },
            authorProfile: myProfile,
          },
        ],
      ]);

      const replyBytes = encodeReply({
        schema: Constants.REPLY_SCHEMA_URI,
        parentCid: priorPostCid,
        content: 'Reply referencing prior session post',
        mediaCids: [],
        timestampMs: BigInt(12_000),
      });
      const replyEnvelope = createEnvelope(
        { payload: replyBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const replyPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(replyEnvelope)));
      const item = makeStoreItem(replyPayload, toHex(replyEnvelope.headerHash));

      const followingSet = new Set<string>();
      const result = FeedProcessor.process(
        [item],
        myProfile,
        profileMap,
        followingSet,
        myCreatorIdHex,
        extraPosts,
      );

      // Reply resolves, notification fires because it's replying to myCreatorIdHex's post
      expect(result.replyItems).toHaveLength(1);
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe(1);
    });
  });

  // ── 12. Repost with unknown original post CID ─────────────────────────────

  describe('repost with unknown original post CID', () => {
    it('is silently skipped (no feedItem injected) and emits debug log', () => {
      const unknownPostCid = new Uint8Array(32).fill(0xee);
      const repostBytes = encodeRepost({
        schema: Constants.REPOST_SCHEMA_URI,
        originalPostCid: unknownPostCid,
        originalAuthorCid: peerCreatorId,
        commentary: '',
        timestampMs: BigInt(13_000),
      });
      const repostEnvelope = createEnvelope(
        { payload: repostBytes, payloadType: 0x50, creatorId: peerCreatorId, privateKey: peerPrivateKey },
        crypto,
      );
      const repostPayload = btoa(String.fromCharCode(...encodeEnvelopeProto(repostEnvelope)));
      const item = makeStoreItem(repostPayload, toHex(repostEnvelope.headerHash));

      let result!: ProcessedResults;
      expect(() => {
      const followingSet = new Set<string>();
      result = FeedProcessor.process([item], myProfile, profileMap, followingSet, myCreatorIdHex);
      }).not.toThrow();

      expect(result.feedItems).toHaveLength(0);
      // repostMap is still populated with the entry
      expect(result.repostMap.has(toHex(unknownPostCid))).toBe(true);

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('FeedProcessor: repost references unknown original CID'),
        expect.any(String),
      );
    });
  });
});
