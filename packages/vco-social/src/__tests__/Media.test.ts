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

// Mock schemas
vi.mock('@vco/vco-schemas', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    decodeSequenceManifest: vi.fn(() => ({
      chunkCids: [new Uint8Array([10]), new Uint8Array([20])],
      mimeType: 'video/mp4'
    })),
  };
});

// Mock URL.createObjectURL
if (typeof window === 'undefined') {
  (global as any).URL = {
    createObjectURL: vi.fn((blob) => `blob:vco-test-url-${blob.type}`),
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
    const size = 1.5 * 1024 * 1024;
    const fileContent = new Uint8Array(size).fill(0);
    const mockFile: any = {
      arrayBuffer: async () => fileContent.buffer,
      type: 'video/mp4'
    };

    const manifestCid = await MediaService.processAndStore(mockFile);
    expect(manifestCid).toBeDefined();
    expect(vcoStore.putBlob).toHaveBeenCalledTimes(3);
  });

  it('should resolve a single blob CID to a URL', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    (vcoStore.getBlob as any).mockResolvedValue(mockBlob);

    const cid = new Uint8Array([1, 2, 3]);
    const url = await MediaService.resolveToUrl(cid);

    expect(url).toBe('blob:vco-test-url-image/jpeg');
  });

  it('should reconstruct a file from a SequenceManifest during resolution', async () => {
    const manifestCid = new Uint8Array([1, 1, 1]);
    const chunk1Cid = new Uint8Array([10]);
    const chunk2Cid = new Uint8Array([20]);

    const manifestBlob = new Blob([new Uint8Array([0])], { type: 'application/x-protobuf' });
    const chunk1Blob = new Blob(['chunk1'], { type: 'application/octet-stream' });
    const chunk2Blob = new Blob(['chunk2'], { type: 'application/octet-stream' });

    (vcoStore.getBlob as any).mockImplementation(async (hex: string) => {
      if (hex === toHex(manifestCid)) return manifestBlob;
      if (hex === toHex(chunk1Cid)) return chunk1Blob;
      if (hex === toHex(chunk2Cid)) return chunk2Blob;
      return null;
    });

    const url = await MediaService.resolveToUrl(manifestCid);

    expect(url).toBe('blob:vco-test-url-video/mp4');
    expect(vcoStore.getBlob).toHaveBeenCalledWith(toHex(manifestCid));
    expect(vcoStore.getBlob).toHaveBeenCalledWith(toHex(chunk1Cid));
    expect(vcoStore.getBlob).toHaveBeenCalledWith(toHex(chunk2Cid));
  });

  it('should return null if content is missing both locally and from network after polling', async () => {
    (vcoStore.getBlob as any).mockResolvedValue(null);
    
    vi.mock('../lib/NodeClient', () => ({
      NodeClient: {
        getInstance: () => ({
          resolve: vi.fn(),
        })
      }
    }));

    const cid = new Uint8Array([1, 2, 3]);
    const resolvePromise = MediaService.resolveToUrl(cid);
    
    for (let i = 0; i < 10; i++) {
      await vi.advanceTimersByTimeAsync(1000);
    }
    
    const url = await resolvePromise;
    expect(url).toBeNull();
  });
});
