// @vitest-environment node
/**
 * SocialE2E.test.ts — End-to-end integration tests for the vco-social app flow.
 *
 * Covers:
 *   1. Envelope creation → VcoStore → FeedProcessor rendering
 *   2. NodeClient gossipsub path: synthetic Tauri event → decoded → stored
 *   3. @mention / reply linkage via parentCid → creatorId
 *   4. Silent failure detection: malformed gossipsub envelope emits error, not silent swallow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setPlatform } from '../lib/platform';
import { MockPlatform } from './PlatformTestUtils';

// --- ROBUST INDEXEDDB MOCK ---
class MockIDBRequest {
  result: any;
  error: any;
  onsuccess: any;
  onerror: any;
  onupgradeneeded: any;
  transaction: any;
}

class MockIDBObjectStore {
  data = new Map<string, any>();
  indexNames = { contains: vi.fn(() => true) };
  
  put = vi.fn((val: any) => {
    const key = val.cid || val.creatorId;
    this.data.set(key, val);
    const req = new MockIDBRequest();
    setTimeout(() => req.onsuccess?.({ target: req }), 0);
    return req;
  });

  get = vi.fn((key: string) => {
    const req = new MockIDBRequest();
    req.result = this.data.get(key);
    setTimeout(() => req.onsuccess?.({ target: req }), 0);
    return req;
  });

  getAll = vi.fn(() => {
    const req = new MockIDBRequest();
    req.result = Array.from(this.data.values());
    setTimeout(() => req.onsuccess?.({ target: req }), 0);
    return req;
  });

  count = vi.fn(() => {
    const req = new MockIDBRequest();
    req.result = this.data.size;
    setTimeout(() => req.onsuccess?.({ target: req }), 0);
    return req;
  });

  clear = vi.fn(() => {
    this.data.clear();
    const req = new MockIDBRequest();
    setTimeout(() => req.onsuccess?.({ target: req }), 0);
    return req;
  });

  index = vi.fn(() => ({
    openCursor: vi.fn(() => {
      const req = new MockIDBRequest();
      const values = Array.from(this.data.values());
      let idx = 0;
      const cursor = {
        get value() { return values[idx]; },
        continue: () => {
          idx++;
          if (idx < values.length) req.onsuccess({ target: { result: cursor } });
          else req.onsuccess({ target: { result: null } });
        },
        delete: vi.fn()
      };
      setTimeout(() => req.onsuccess?.({ target: { result: values.length > 0 ? cursor : null } }), 0);
      return req;
    })
  }));

  openCursor = vi.fn(() => this.index().openCursor());
}

class MockIDBTransaction {
  objectStore = vi.fn((name: string) => stores[name] || (stores[name] = new MockIDBObjectStore()));
  oncomplete: any;
  onerror: any;
  abort = vi.fn();
  constructor() {
    setTimeout(() => this.oncomplete?.(), 10);
  }
}

let stores: Record<string, MockIDBObjectStore> = {};

const mockIDB = {
  open: vi.fn((name: string) => {
    const req = new MockIDBRequest();
    const db = {
      transaction: vi.fn(() => new MockIDBTransaction()),
      close: vi.fn(),
      objectStoreNames: { contains: vi.fn(() => true) },
      createObjectStore: vi.fn((name: string) => stores[name] || (stores[name] = new MockIDBObjectStore())),
      deleteObjectStore: vi.fn()
    };
    req.result = db;
    setTimeout(() => {
      req.onupgradeneeded?.({ target: req });
      req.onsuccess?.({ target: req });
    }, 0);
    return req;
  })
};

// ── Tauri stubs (must precede all imports that pull Tauri) ─────────────────
vi.mock('@tauri-apps/plugin-shell', () => ({ Command: {}, Child: {} }));
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn(async () => 'e2e-profile') }));

// Capture the listen callback so tests can fire synthetic events.
let capturedListenCallback: ((event: { payload: any }) => void) | null = null;

// ── Real VCO stack imports ───────────────────────────────────────────────────
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
} from '@vco/vco-schemas';

import { VcoStore } from '../lib/VcoStore';
import { FeedProcessor } from '../lib/FeedProcessor';
import { NodeClient } from '../lib/NodeClient';
import { toHex } from '../lib/encoding';
import { 
  GLOBAL_SOCIAL_CHANNEL,
  POST_SCHEMA_URI,
  REPLY_SCHEMA_URI
} from '../lib/constants';

// ── Helpers ──────────────────────────────────────────────────────────────────

const crypto = createNobleCryptoProvider();

function seedPrivKey(seed: number): Uint8Array {
  const k = new Uint8Array(32);
  k.fill(seed);
  return k;
}

/** 
 * Build a 'StoredEnvelope' record like the one returned by store.getAllEnvelopes().
 * FeedProcessor.process() expects an array of these objects with base64 'payload'.
 */
function buildStoredRecord(env: any, channelId: string) {
  const wire = encodeEnvelopeProto(env);
  return {
    cid: toHex(env.headerHash),
    channelId,
    payload: btoa(String.fromCharCode(...wire)),
    syncStatus: 'synced'
  };
}

/** Re-initialize the NodeClient singleton between tests. */
function resetSingleton() {
  (NodeClient as any).instance = undefined;
}

/** Node implementation of bytes to base64. */
function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

describe('SocialE2E — envelope creation → store → feed (Platform Abstracted)', () => {
  let vcoStore: VcoStore;
  let mockPlatform: MockPlatform;

  beforeEach(async () => {
    mockPlatform = new MockPlatform();
    mockPlatform.profile = "e2e-profile";
    mockPlatform.getIndexedDB = vi.fn(() => mockIDB as any);
    mockPlatform.listen = vi.fn(async (_name, cb) => {
      capturedListenCallback = cb;
      return () => {};
    });
    setPlatform(mockPlatform);

    stores = {};
    vcoStore = new VcoStore();
    resetSingleton();
    vi.clearAllMocks();
  });

  it('creates a real Post envelope, stores it, and FeedProcessor includes it in the feed', async () => {
    // 1. Setup Identity
    const privKey = seedPrivKey(1);
    const creatorId = deriveEd25519Multikey(privKey);
    
    // 2. Create Post
    const postData = {
      schema: POST_SCHEMA_URI,
      content: "Hellosworld",
      timestamp: BigInt(Date.now()),
      mediaCids: []
    };
    const encodedPost = encodePost(postData);
    
    const env = await createEnvelope({
      payload: encodedPost,
      payloadType: MULTICODEC_PROTOBUF,
      creatorId,
      privateKey: privKey,
    }, crypto);

    // 3. Store
    await vcoStore.storeEnvelope(env, 'synced', GLOBAL_SOCIAL_CHANNEL);

    // 4. FeedProcessor
    const envelopes = await vcoStore.getAllEnvelopes();
    const myProfile = { schema: "", displayName: "Me", bio: "", avatarCid: new Uint8Array(0), nip05: "", lightningAddress: "", customFields: {} };
    const profileMap = new Map();
    const followingSet = new Set<string>();
    
    const { feedItems } = FeedProcessor.process(envelopes, myProfile, profileMap, followingSet, toHex(creatorId));

    expect(feedItems).toHaveLength(1);
    expect(feedItems[0].data.content).toBe("Hellosworld");
    expect(toHex(feedItems[0].authorId)).toBe(toHex(creatorId));
  });

  it('NodeClient envelope event decodes a base64 gossipsub envelope and writes it to vcoStore', async () => {
    const client = NodeClient.getInstance();
    await client.connect();

    expect(capturedListenCallback).not.toBeNull();

    // Create a real envelope to encode as base64
    const privKey = seedPrivKey(2);
    const creatorId = deriveEd25519Multikey(privKey);
    const postData = {
      schema: POST_SCHEMA_URI,
      content: "Gossipsub delivery test",
      timestamp: BigInt(Date.now()),
      mediaCids: []
    };
    const env = await createEnvelope({
      payload: encodePost(postData),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId,
      privateKey: privKey,
    }, crypto);
    
    const envelopeB64 = bytesToBase64(encodeEnvelopeProto(env));
    const channelId = toHex(env.header.contextId && env.header.contextId.length > 0 ? env.header.contextId : env.header.creatorId);

    // Fire synthetic event
    await capturedListenCallback!({
      payload: {
        type: 'envelope',
        channelId,
        envelope: envelopeB64
      }
    });

    // Verify it reached the store (give it a small tick for the async import in NodeClient)
    await new Promise(r => setTimeout(r, 50));
    const all = await vcoStore.getAllEnvelopes();
    expect(all).toHaveLength(1);
    expect(all[0].channelId).toBe(channelId);
    expect(all[0].payload).toBe(envelopeB64);
  });

  it('reply parentCid resolves back to the post author creatorId', async () => {
    const alicePriv = seedPrivKey(10);
    const bobPriv = seedPrivKey(20);
    const aliceId = deriveEd25519Multikey(alicePriv);
    const bobId = deriveEd25519Multikey(bobPriv);

    // 1. Alice Posts
    const postEnv = await createEnvelope({
      payload: encodePost({ schema: POST_SCHEMA_URI, content: "Alice Post", timestamp: BigInt(Date.now()), mediaCids: [] }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: aliceId,
      privateKey: alicePriv,
    }, crypto);
    const postCid = toHex(postEnv.headerHash);
    await vcoStore.storeEnvelope(postEnv, 'synced', GLOBAL_SOCIAL_CHANNEL);

    // 2. Bob Replies to Alice
    const replyEnv = await createEnvelope({
      payload: encodeReply({ schema: REPLY_SCHEMA_URI, content: "Bob Reply", parentCid: postEnv.headerHash, timestamp: BigInt(Date.now()) }),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: bobId,
      privateKey: bobPriv,
    }, crypto);
    await vcoStore.storeEnvelope(replyEnv, 'synced', GLOBAL_SOCIAL_CHANNEL);

    // 3. Process Feed (Two-pass simulation)
    const envelopes = await vcoStore.getAllEnvelopes();
    const myProfile = { schema: "", displayName: "Me", bio: "", avatarCid: new Uint8Array(0), nip05: "", lightningAddress: "", customFields: {} };
    const profileMap = new Map();
    const followingSet = new Set<string>();

    // Pass 1: Cache the post
    const results1 = FeedProcessor.process(envelopes, myProfile, profileMap, followingSet, toHex(aliceId));
    
    // Pass 2: Process again, seeding with the cached post results to ensure linkage
    const extraPosts = new Map();
    results1.feedItems.forEach(item => {
      extraPosts.set(toHex(item.cid), { authorId: item.authorId, data: item.data, authorProfile: item.authorProfile });
    });

    const { replyItems } = FeedProcessor.process(envelopes, myProfile, profileMap, followingSet, toHex(aliceId), extraPosts);

    expect(replyItems).toHaveLength(1);
    expect(toHex(replyItems[0].data.parentCid)).toBe(postCid);
    // authorProfile is Bob's profile
    expect(replyItems[0].authorProfile.displayName).toBe("User " + toHex(bobId).substring(0, 6));
  });

  it('malformed base64 gossipsub envelope emits an error event and does NOT call vcoStore', async () => {
    const client = NodeClient.getInstance();
    const errorListener = vi.fn();
    client.onEvent(errorListener);
    await client.connect();

    // Fire malformed event (invalid protobuf wire type)
    await capturedListenCallback!({
      payload: {
        type: 'envelope',
        channelId: 'deadbeef',
        envelope: bytesToBase64(new Uint8Array([0x08, 0x01, 0x12, 0x04, 0x64, 0x65, 0x61, 0x64, 0x1a, 0xff])) 
      }
    });

    await new Promise(r => setTimeout(r, 50));
    
    // Check error emission
    expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      message: expect.stringContaining('Failed to decode gossipsub envelope')
    }));

    // Verify store is empty
    const all = await vcoStore.getAllEnvelopes();
    expect(all).toHaveLength(0);
  });
});
