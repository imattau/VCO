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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

if (typeof window === 'undefined') {
  (global as any).window = {
    __TAURI_INTERNALS__: {}
  };
  (global as any).localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  (global as any).indexedDB = mockIDB;
}

// ── Tauri stubs (must precede all imports that pull Tauri) ─────────────────
vi.mock('@tauri-apps/plugin-shell', () => ({ Command: {}, Child: {} }));
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn(async () => 'e2e-profile') }));

// Capture the listen callback so tests can fire synthetic events.
let capturedListenCallback: ((event: { payload: any }) => void) | null = null;
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(async (_name, cb) => {
    capturedListenCallback = cb;
    return () => {};
  }),
}));

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

describe('SocialE2E — envelope creation → store → feed', () => {
  let store: VcoStore;

  beforeEach(() => {
    store = new VcoStore();
    capturedListenCallback = null;
    resetSingleton();
    stores = {}; // Clear mock stores
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Test 1: envelope creation → store → FeedProcessor ───────────────────

  it('creates a real Post envelope, stores it, and FeedProcessor includes it in the feed', async () => {
    const privKey = seedPrivKey(0x01);
    const creatorId = deriveEd25519Multikey(privKey);

    const postPayload = encodePost({
      schema: POST_SCHEMA_URI,
      content: 'Hello VCO world! #vco',
      mediaCids: [],
      timestampMs: BigInt(1_700_000_000_000),
    });

    const postEnv = createEnvelope(
      { payload: postPayload, payloadType: MULTICODEC_PROTOBUF, creatorId, privateKey: privKey },
      crypto,
    );

    // Store via VcoStore.storeEnvelope (the canonical write path)
    await store.storeEnvelope(postEnv, 'synced');

    // Retrieve all and confirm persistence
    const all = await store.getAllEnvelopes();
    expect(all).toHaveLength(1);
    expect(all[0].headerHash).toBe(toHex(postEnv.headerHash));
    expect(all[0].syncStatus).toBe('synced');

    // Build a FeedProcessor-compatible batch from the stored record and confirm
    // the post appears in feedItems.
    const storedRecord = buildStoredRecord(postEnv, GLOBAL_SOCIAL_CHANNEL);

    const myCreatorIdHex = toHex(creatorId);
    const myProfile = {
      schema: 'vco://schemas/identity/profile/v1',
      displayName: 'Alice',
      avatarCid: new Uint8Array(0),
      previousManifest: new Uint8Array(0),
      bio: 'Test user',
    };

    const { feedItems } = FeedProcessor.process(
      [storedRecord],
      myProfile,
      new Map(),
      myCreatorIdHex,
    );

    expect(feedItems).toHaveLength(1);
    expect(feedItems[0].data.content).toBe('Hello VCO world! #vco');
    expect(toHex(feedItems[0].authorId)).toBe(myCreatorIdHex);
  });

  // ── Test 2: NodeClient gossipsub event → decoded → stored ────────────────

  it('NodeClient envelope event decodes a base64 gossipsub envelope and writes it to vcoStore', async () => {
    // Simulate running inside Tauri so NodeClient registers the listener.
    (window as any).__TAURI_INTERNALS__ = {};

    const client = NodeClient.getInstance();
    const events: any[] = [];
    client.onEvent(e => events.push(e));

    await client.connect();

    // Verify listen() was called and the callback was captured.
    expect(capturedListenCallback).not.toBeNull();

    // Build a real envelope to send over the fake gossipsub channel.
    const privKey = seedPrivKey(0x02);
    const creatorId = deriveEd25519Multikey(privKey);
    const postPayload = encodePost({
      schema: POST_SCHEMA_URI,
      content: 'Gossipsub delivery test',
      mediaCids: [],
      timestampMs: BigInt(1_700_000_001_000),
    });
    const postEnv = createEnvelope(
      { payload: postPayload, payloadType: MULTICODEC_PROTOBUF, creatorId, privateKey: privKey },
      crypto,
    );
    const encoded = encodeEnvelopeProto(postEnv);
    const envelopeB64 = bytesToBase64(encoded);

    // Spy on VcoStore.storeEnvelope to confirm it is called.
    // We import the singleton vcoStore that NodeClient uses internally.
    const { vcoStore } = await import('../lib/VcoStore');
    const storeEnvelopeSpy = vi.spyOn(vcoStore, 'storeEnvelope');

    // Fire the synthetic Tauri IPC event.
    capturedListenCallback!({
      payload: {
        type: 'envelope',
        channelId: toHex(creatorId),
        envelope: envelopeB64,
      },
    });

    // NodeClient processes the envelope via a dynamic import + promise chain.
    // Wait for all microtasks and timers to drain.
    await vi.waitFor(
      () => expect(storeEnvelopeSpy).toHaveBeenCalledTimes(1),
      { timeout: 3000 },
    );

    const [storedEnv, syncStatus] = storeEnvelopeSpy.mock.calls[0];
    expect(syncStatus).toBe('pending');
    expect(toHex(storedEnv.headerHash)).toBe(toHex(postEnv.headerHash));

    storeEnvelopeSpy.mockRestore();
  });

  // ── Test 3: @mention / reply parentCid → author creatorId linkage ────────

  it('reply parentCid resolves back to the post author creatorId', async () => {
    const alicePrivKey = seedPrivKey(0x0a);
    const aliceCreatorId = deriveEd25519Multikey(alicePrivKey);

    const bobPrivKey = seedPrivKey(0x0b);
    const bobCreatorId = deriveEd25519Multikey(bobPrivKey);

    // Alice posts.
    const postPayload = encodePost({
      schema: POST_SCHEMA_URI,
      content: 'Alice original post',
      mediaCids: [],
      timestampMs: BigInt(1_700_000_002_000),
    });
    const postEnv = createEnvelope(
      { payload: postPayload, payloadType: MULTICODEC_PROTOBUF, creatorId: aliceCreatorId, privateKey: alicePrivKey },
      crypto,
    );

    // Bob replies, referencing Alice's post headerHash as parentCid.
    const replyPayload = encodeReply({
      schema: REPLY_SCHEMA_URI,
      parentCid: postEnv.headerHash,
      content: '@alice great post!',
      mediaCids: [],
      timestampMs: BigInt(1_700_000_003_000),
    });
    const replyEnv = createEnvelope(
      { payload: replyPayload, payloadType: MULTICODEC_PROTOBUF, creatorId: bobCreatorId, privateKey: bobPrivKey },
      crypto,
    );

    // Store both envelopes.
    await store.storeEnvelope(postEnv, 'synced');
    await store.storeEnvelope(replyEnv, 'synced');

    const all = await store.getAllEnvelopes();
    expect(all).toHaveLength(2);

    // Feed the stored records through FeedProcessor (as Alice viewing her own feed).
    const aliceCreatorIdHex = toHex(aliceCreatorId);
    const bobCreatorIdHex = toHex(bobCreatorId);

    const postRecord = buildStoredRecord(postEnv, GLOBAL_SOCIAL_CHANNEL);
    const replyRecord = buildStoredRecord(replyEnv, GLOBAL_SOCIAL_CHANNEL);

    const bobProfile = {
      schema: 'vco://schemas/identity/profile/v1',
      displayName: 'Bob',
      avatarCid: new Uint8Array(0),
      previousManifest: new Uint8Array(0),
      bio: '',
    };
    const aliceProfile = {
      schema: 'vco://schemas/identity/profile/v1',
      displayName: 'Alice',
      avatarCid: new Uint8Array(0),
      previousManifest: new Uint8Array(0),
      bio: '',
    };

    const profileMap = new Map([[bobCreatorIdHex, bobProfile]]);

    const { feedItems, replyItems } = FeedProcessor.process(
      [postRecord, replyRecord],
      aliceProfile,
      profileMap,
      aliceCreatorIdHex,
    );

    // The post should appear in the feed.
    expect(feedItems).toHaveLength(1);
    expect(feedItems[0].data.content).toBe('Alice original post');
    expect(toHex(feedItems[0].authorId)).toBe(aliceCreatorIdHex);

    // The reply should appear in replyItems.
    expect(replyItems).toHaveLength(1);
    const reply = replyItems[0];
    expect(reply.data.content).toBe('@alice great post!');

    // The reply's parentCid must match Alice's post headerHash — this is the
    // @mention linkage: by resolving parentCid → post, you reach the author.
    expect(toHex(reply.data.parentCid)).toBe(toHex(postEnv.headerHash));

    // The only feed item (the post) must be authored by Alice.
    // This closes the @mention chain: reply.parentCid → post.headerHash → post.authorId === aliceCreatorId.
    expect(toHex(feedItems[0].cid)).toBe(toHex(postEnv.headerHash));
    expect(toHex(feedItems[0].authorId)).toBe(aliceCreatorIdHex);
  });

  // ── Test 4: malformed gossipsub envelope → error event, store not called ─

  it('malformed base64 gossipsub envelope emits an error event and does NOT call vcoStore', async () => {
    (window as any).__TAURI_INTERNALS__ = {};

    const client = NodeClient.getInstance();
    const events: any[] = [];
    client.onEvent(e => events.push(e));

    await client.connect();
    expect(capturedListenCallback).not.toBeNull();

    const { vcoStore } = await import('../lib/VcoStore');
    const storeEnvelopeSpy = vi.spyOn(vcoStore, 'storeEnvelope');

    // Fire a corrupt payload (valid base64 but not a valid protobuf envelope).
    const corruptB64 = btoa('this is not a valid vco envelope at all \x00\xFF\xFE');
    capturedListenCallback!({
      payload: {
        type: 'envelope',
        channelId: 'deadbeef',
        envelope: corruptB64,
      },
    });

    // Allow async chains to settle.
    await new Promise(resolve => setTimeout(resolve, 500));

    // NodeClient logs a warning via console.warn for bad envelopes and emits an error event.
    const errorEvents = events.filter(e => e.type === 'error');
    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0].message).toContain('Failed to decode gossipsub envelope');

    expect(storeEnvelopeSpy).not.toHaveBeenCalled();

    storeEnvelopeSpy.mockRestore();
  });
});
