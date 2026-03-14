import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaService } from '../lib/MediaService';
import { vcoStore } from '../lib/VcoStore';
import { toHex } from '@vco/vco-testing';

// Mock vcoStore
vi.mock('../lib/VcoStore', () => ({
  vcoStore: {
    putBlob: vi.fn(async () => {}),
    getBlob: vi.fn(async () => null),
  }
}));

// Mock URL.createObjectURL
if (typeof window === 'undefined') {
  (global as any).URL = {
    createObjectURL: vi.fn(() => 'blob:vco-test-url'),
  };
}

describe('MediaService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should process and store a small file as a single blob', async () => {
    const fileContent = new Uint8Array([1, 2, 3, 4]);
    const mockFile: any = {
      arrayBuffer: async () => fileContent.buffer,
      type: 'image/png'
    };

    const cid = await MediaService.processAndStore(mockFile);
    
    expect(cid).toBeDefined();
    expect(cid).toBeInstanceOf(Uint8Array);
    expect(vcoStore.putBlob).toHaveBeenCalledTimes(1);
    expect(vcoStore.putBlob).toHaveBeenCalledWith(expect.any(String), mockFile);
  });

  it('should fragment a large file into multiple chunks and a manifest', async () => {
    // 1.5 MB file (Chunk size is 1MB)
    const size = 1.5 * 1024 * 1024;
    const fileContent = new Uint8Array(size).fill(0);
    const mockFile: any = {
      arrayBuffer: async () => fileContent.buffer,
      type: 'video/mp4'
    };

    const manifestCid = await MediaService.processAndStore(mockFile);
    
    expect(manifestCid).toBeDefined();
    
    // Expected: 2 chunks + 1 manifest = 3 blobs
    expect(vcoStore.putBlob).toHaveBeenCalledTimes(3);
  });

  it('should resolve a CID to a URL from local storage', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    (vcoStore.getBlob as any).mockResolvedValue(mockBlob);

    const cid = new Uint8Array([1, 2, 3]);
    const url = await MediaService.resolveToUrl(cid);

    expect(url).toBe('blob:vco-test-url');
    expect(vcoStore.getBlob).toHaveBeenCalledWith(toHex(cid));
  });

  it('should return null if content is missing both locally and from network after polling', async () => {
    (vcoStore.getBlob as any).mockResolvedValue(null);
    
    // Mock NodeClient to avoid network calls during resolution wait
    vi.mock('../lib/NodeClient', () => ({
      NodeClient: {
        getInstance: () => ({
          resolve: vi.fn(),
        })
      }
    }));

    const cid = new Uint8Array([1, 2, 3]);
    
    const resolvePromise = MediaService.resolveToUrl(cid);
    
    // Advance timers to trigger all 10 polling attempts
    for (let i = 0; i < 10; i++) {
      await vi.advanceTimersByTimeAsync(1000);
    }
    
    const url = await resolvePromise;
    expect(url).toBeNull();
  });
});
