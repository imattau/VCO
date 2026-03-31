import { describe, it, expect } from 'vitest';
import { SearchLogic } from '../lib/SearchLogic';
import { FeedItem } from '../lib/FeedProcessor';
import { ProfileData } from '@vco/vco-schemas';

describe('Search & Trending Unit Tests', () => {
  
  describe('deriveTrendingTags', () => {
    it('should correctly count and sort hashtags', () => {
      const feed: any[] = [
        { data: { tags: ['vco', 'rust'] } },
        { data: { tags: ['vco', 'libp2p'] } },
        { data: { tags: ['vco'] } },
        { data: { tags: ['rust', 'crypto'] } }
      ];

      const trending = SearchLogic.deriveTrendingTags(feed as FeedItem[], 3);

      expect(trending).toHaveLength(3);
      expect(trending[0]).toBe('#VCO'); // Count 3
      expect(trending[1]).toBe('#RUST'); // Count 2
      expect(trending[2]).toBe('#LIBP2P'); // Count 1 (or crypto)
    });

    it('should handle feed with no tags', () => {
      const feed: any[] = [{ data: {} }, { data: { tags: [] } }];
      expect(SearchLogic.deriveTrendingTags(feed as FeedItem[])).toEqual([]);
    });
  });

  describe('filterPeers', () => {
    const peerProfiles = new Map<string, ProfileData>();
    peerProfiles.set('deadbeef', { displayName: 'Alice Swarm', bio: '' } as any);
    peerProfiles.set('cafebabe', { displayName: 'Bob Decentral', bio: '' } as any);

    it('should match peers by display name', () => {
      const results = SearchLogic.filterPeers(peerProfiles, 'alice');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice Swarm');
    });

    it('should match peers by creator ID (DID)', () => {
      const results = SearchLogic.filterPeers(peerProfiles, 'cafe');
      expect(results).toHaveLength(1);
      expect(results[0].creatorId).toBe('cafebabe');
    });

    it('should return empty list for no matches', () => {
      expect(SearchLogic.filterPeers(peerProfiles, 'unknown')).toEqual([]);
    });

    it('should return empty list for empty query', () => {
      expect(SearchLogic.filterPeers(peerProfiles, '')).toEqual([]);
    });
  });

});
