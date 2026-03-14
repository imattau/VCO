import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NetworkService } from '../lib/NetworkService';
import { FeedService } from '../lib/FeedService';
import { NodeClient } from '../lib/NodeClient';
import { vcoStore } from '../lib/VcoStore';

// Mock NodeClient
const mockClient = {
  getStats: vi.fn(),
  peerId: 'test-peer',
  multiaddrs: ['/ip4/1.2.3.4'],
  peers: ['peer1'],
  connections: [],
  isReady: true,
  resolve: vi.fn()
};

vi.mock('../lib/NodeClient', () => {
  return {
    NodeClient: {
      getInstance: vi.fn(() => mockClient)
    }
  };
});

// Mock vcoStore
vi.mock('../lib/VcoStore', () => ({
  vcoStore: {
    putBlob: vi.fn(async () => {}),
  }
}));

describe('Additional Services Unit Tests', () => {
  
  describe('NetworkService', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.clearAllMocks();
    });

    afterEach(() => {
      NetworkService.stopPolling();
      vi.useRealTimers();
    });

    it('should start polling and call the callback immediately', () => {
      const callback = vi.fn();
      NetworkService.startPolling(callback, 1000);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        peerId: 'test-peer',
        isReady: true
      }));
    });

    it('should continue polling at the specified interval', () => {
      const callback = vi.fn();
      NetworkService.startPolling(callback, 1000);
      
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);
      
      vi.advanceTimersByTime(2000);
      expect(callback).toHaveBeenCalledTimes(4);
    });

    it('should stop polling correctly', () => {
      const callback = vi.fn();
      NetworkService.startPolling(callback, 1000);
      NetworkService.stopPolling();
      
      vi.advanceTimersByTime(2000);
      expect(callback).toHaveBeenCalledTimes(1); // Only the initial call
    });

    it('should invoke resolve on NodeClient', async () => {
      await NetworkService.resolvePeer('some-creator-id');
      expect(mockClient.resolve).toHaveBeenCalledWith('some-creator-id');
    });
  });

  describe('FeedService', () => {
    it('should encode a post and store media blobs', async () => {
      const mockFile = {
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
        name: 'test.jpg'
      } as File;

      const encoded = await FeedService.publishPost("Hello Swarm", [mockFile]);
      
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(vcoStore.putBlob).toHaveBeenCalledTimes(1);
    });
  });

});
