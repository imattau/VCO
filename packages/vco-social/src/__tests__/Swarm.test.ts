import { describe, it, expect, vi } from 'vitest';
import { SwarmLogic } from '../lib/SwarmLogic';
import { NodeClient, NodeEvent } from '../lib/NodeClient';

// Mock Tauri
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
}));

describe('Swarm & Discovery Unit Tests', () => {
  
  describe('SwarmLogic Stats', () => {
    it('should correctly aggregate swarm activity counts', () => {
      const following = new Set(['peer1', 'peer2']);
      const feedLength = 15;
      const notifCount = 3;
      const convCount = 2;

      const stats = SwarmLogic.calculateStats(following, feedLength, notifCount, convCount);

      expect(stats.followingCount).toBe(2);
      expect(stats.postsCount).toBe(15);
      expect(stats.syncCount).toBe(3);
      expect(stats.sessionCount).toBe(2);
    });

    it('should determine peer indexing eligibility', () => {
      const validProfile: any = { displayName: "Alice" };
      const invalidProfile: any = { displayName: "" };

      expect(SwarmLogic.shouldIndexPeer(validProfile)).toBe(true);
      expect(SwarmLogic.shouldIndexPeer(invalidProfile)).toBe(false);
    });
  });

  describe('NodeClient Event Handling (Discovery)', () => {
    it('should update internal state on stats event', () => {
      const client = NodeClient.getInstance();
      
      // Accessing private method for testing discovery logic
      const handleEvent = (client as any).handleEvent.bind(client);

      const statsEvent: NodeEvent = {
        type: 'stats',
        peerId: 'local-peer-id',
        multiaddrs: ['/ip4/1.2.3.4/tcp/1234'],
        peers: ['peer-a', 'peer-b'],
        connections: [
          { remotePeer: 'peer-a', remoteAddr: '/ip4/5.6.7.8/tcp/1234', tags: ['connected'] }
        ],
        networkLoad: 1.5
      };

      handleEvent(statsEvent);

      expect(client.isReady).toBe(true);
      expect(client.peerId).toBe('local-peer-id');
      expect(client.peers).toHaveLength(2);
      expect(client.connections).toHaveLength(1);
      expect(client.connections[0].remotePeer).toBe('peer-a');
    });

    it('should trigger listeners on discovery events', () => {
      const client = NodeClient.getInstance();
      const handleEvent = (client as any).handleEvent.bind(client);
      
      let listenerCalled = false;
      const cleanup = client.onEvent((e) => {
        if (e.type === 'resolving' && e.cid === 'target-cid') {
          listenerCalled = true;
        }
      });

      handleEvent({ type: 'resolving', cid: 'target-cid', channelId: 'vco://test' });

      expect(listenerCalled).toBe(true);
      cleanup();
    });
  });

});
