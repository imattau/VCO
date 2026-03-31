import { ProfileData } from '@vco/vco-schemas';

export interface SwarmStats {
  followingCount: number;
  postsCount: number;
  syncCount: number;
  sessionCount: number;
}

export class SwarmLogic {
  /**
   * Calculates high-level swarm statistics from disparate state pieces.
   */
  static calculateStats(
    following: Set<string>,
    feedLength: number,
    notificationCount: number,
    conversationCount: number
  ): SwarmStats {
    return {
      followingCount: following.size,
      postsCount: feedLength,
      syncCount: notificationCount,
      sessionCount: conversationCount
    };
  }

  /**
   * Helper to determine if a peer should be added to the social graph.
   * Logic could involve verification status, last seen, etc.
   */
  static shouldIndexPeer(profile: ProfileData): boolean {
    // Current simple logic: must have a display name
    return profile.displayName.length > 0;
  }
}
