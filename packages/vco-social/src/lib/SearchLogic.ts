import { ProfileData } from '@vco/vco-schemas';
import { FeedItem } from './FeedProcessor';

export class SearchLogic {
  /**
   * Derives trending hashtags from a feed, sorted by frequency.
   */
  static deriveTrendingTags(feed: FeedItem[], limit: number = 5): string[] {
    const counts = new Map<string, number>();
    
    feed.forEach(item => {
      (item.data.tags || []).forEach(tag => {
        const normalized = tag.toLowerCase();
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, limit)
      .map(([tag]) => `#${tag.toUpperCase()}`);
  }

  /**
   * Filters a list of peer profiles based on a query string.
   * Matches against display name or creator ID.
   */
  static filterPeers(
    peerProfiles: Map<string, ProfileData>, 
    query: string
  ): { name: string, creatorId: string }[] {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase();
    
    return Array.from(peerProfiles.entries())
      .filter(([id, p]) => 
        p.displayName.toLowerCase().includes(normalizedQuery) || 
        id.toLowerCase().includes(normalizedQuery)
      )
      .map(([id, p]) => ({ 
        name: p.displayName, 
        creatorId: id 
      }));
  }
}
