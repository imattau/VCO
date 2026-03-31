// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { VcoStore } from '../lib/VcoStore';

// Mock IDB with failure capability
class MockIDBRequest {
  result: any;
  error: any;
  onsuccess: any;
  onerror: any;
  onupgradeneeded: any;
  transaction: any;
}

class MockIDBObjectStore {
  put = vi.fn();
  get = vi.fn();
  getAll = vi.fn();
  count = vi.fn();
  clear = vi.fn();
  index = vi.fn();
  openCursor = vi.fn();
}

class MockIDBTransaction {
  objectStore = vi.fn(() => new MockIDBObjectStore());
  oncomplete: any;
  onerror: any;
  onabort: any;
  abort = vi.fn();
  error: any = null;
}

if (typeof window === 'undefined') {
  (global as any).window = { __TAURI_INTERNALS__: {} };
}

describe('VcoStore Error Handling', () => {
  it('should reject when putEnvelope transaction fails', async () => {
    const mockIDB = {
      open: vi.fn(() => {
        const req = new MockIDBRequest();
        const db = {
          transaction: vi.fn(() => {
            const tx = new MockIDBTransaction();
            tx.error = new Error('Simulated Transaction Failure');
            setTimeout(() => tx.onerror?.({ target: tx }), 0);
            return tx;
          }),
          close: vi.fn(),
          objectStoreNames: { contains: vi.fn(() => true) },
        };
        req.result = db;
        setTimeout(() => req.onsuccess?.({ target: req }), 0);
        return req;
      })
    };
    (global as any).indexedDB = mockIDB;

    const store = new VcoStore();
    const envelope = {
      cid: 'test',
      channelId: 'chan',
      payload: 'abc',
      timestamp: 123
    };

    await expect(store.putEnvelope(envelope as any)).rejects.toThrow('Simulated Transaction Failure');
  });

  it('should handle QuotaExceededError and attempt eviction', async () => {
    const store = new VcoStore();
    const blob = new Blob(['test']);
    
    const mockStore = new MockIDBObjectStore();
    let putCount = 0;
    const quotaError = { name: 'QuotaExceededError' };

    const db = {
      transaction: vi.fn(() => {
        const mockTx = new MockIDBTransaction();
        mockTx.objectStore = vi.fn(() => mockStore);
        
        if (putCount === 0) {
          mockTx.error = quotaError;
          setTimeout(() => mockTx.onerror?.({ target: mockTx }), 10);
        } else {
          setTimeout(() => mockTx.oncomplete?.(), 10);
        }
        return mockTx;
      }),
      close: vi.fn(),
      objectStoreNames: { contains: vi.fn(() => true) },
    };

    mockStore.put.mockImplementation(() => {
      const req = new MockIDBRequest();
      if (putCount === 0) {
        putCount++;
        req.error = quotaError;
        // Request error triggers transaction error in real IDB
      }
      return req;
    });
    
    vi.spyOn(store as any, 'getDB').mockResolvedValue(db);
    const evictSpy = vi.spyOn(store, 'evictOldBlobs').mockResolvedValue();

    await store.putBlob('cid1', blob);
    
    expect(evictSpy).toHaveBeenCalledWith(200);
  });
});
