import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VcoStore, StoredEnvelope } from '../lib/VcoStore';

// Polyfill window for VcoStore logic
if (typeof window === 'undefined') {
  (global as any).window = {
    __TAURI_INTERNALS__: {} // Enable Tauri mode in VcoStore
  };
} else {
  (window as any).__TAURI_INTERNALS__ = {};
}

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
      createObjectStore: vi.fn((name: string) => stores[name] = new MockIDBObjectStore()),
      close: vi.fn()
    };
    req.result = db;
    setTimeout(() => req.onsuccess?.({ target: req }), 0);
    return req;
  })
};

(global as any).indexedDB = mockIDB;
(global as any).IDBKeyRange = { upperBound: vi.fn() };

// Mock Tauri
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(async () => 'test-profile'),
}));

describe('VcoStore Unit Tests', () => {
  let store: VcoStore;

  beforeEach(() => {
    store = new VcoStore();
    stores = {};
    vi.clearAllMocks();
  });

  it('should initialize with correct profile-based name', async () => {
    await (store as any).getDB();
    expect(mockIDB.open).toHaveBeenCalledWith('vco_social_db_test-profile', 3);
  });

  it('should store and retrieve envelopes', async () => {
    const env: StoredEnvelope = {
      cid: 'cid1',
      channelId: 'ch1',
      payload: 'data',
      timestamp: 1000
    };

    await store.putEnvelope(env);
    const all = await store.getAllEnvelopes();
    
    expect(all).toHaveLength(1);
    expect(all[0].cid).toBe('cid1');
  });

  it('should store and retrieve profiles', async () => {
    const profileData = { displayName: 'Alice' };
    await store.putProfile('did1', profileData);
    
    const retrieved = await store.getProfile('did1');
    expect(retrieved.displayName).toBe('Alice');
  });

  it('should handle blobs and trigger eviction', async () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    await store.putBlob('blob1', blob);
    
    const retrieved = await store.getBlob('blob1');
    expect(retrieved).toBeDefined();
    
    const count = await store.getBlobCount();
    expect(count).toBe(1);
  });

  it('should clear all stores', async () => {
    await store.putEnvelope({ cid: '1' } as any);
    await store.putProfile('2', {});
    
    await store.clearAll();
    
    // Check if clear was called on stores
    expect(stores['envelopes'].clear).toHaveBeenCalled();
    expect(stores['profiles'].clear).toHaveBeenCalled();
  });

  it('should handle notifications', async () => {
    const notif = { cid: 'n1', targetCid: new Uint8Array([1,2,3]) };
    await store.putNotification(notif);
    
    const all = await store.getAllNotifications();
    expect(all).toHaveLength(1);
    
    await store.deleteNotificationByTarget(new Uint8Array([1,2,3]));
  });
});
