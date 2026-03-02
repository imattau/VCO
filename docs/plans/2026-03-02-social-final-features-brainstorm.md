# Brainstorming: Finalizing Social Features

**Objective**: Complete the remaining "TODOs" and missing functionality in `vco-social`, specifically focusing on peer-based feed filtering and expanding the peer discovery mechanism.

## 1. Feed Filtering by Peer
- **Observation**: The `SocialContext.tsx` has a `TODO` for filtering the feed by a specific peer/author.
- **Implementation**: 
  - To do this properly, the `PostCard` needs to know *who* the author of a post is. Currently, `PostData` does not explicitly contain `authorCid` (it's assumed the manifest is signed by the author at the envelope level).
  - Since we are simulating the application layer, we should append an `authorCid` to the mock feed items, or simulate resolving the author from the envelope.
  - Update `SocialContext.tsx` to filter by `item.authorCid` when `filter.type === 'peer'`.

## 2. Peer Discovery (Social Graph Expansion)
- **Observation**: `SearchOverlay` allows finding peers, but there's no dedicated view to browse the wider network of creators (like a "Suggested Peers" or "Directory").
- **Implementation**:
  - Enhance `ProfileView` or add a new tab for "Discover Peers".
  - Create a `PeerCard` component that shows a user's avatar, bio, and recent stats, with a `FollowButton`.

## 3. Real Author Resolution in UI
- **Observation**: `PostCard` currently hardcodes "Alice" and "did:vco:1234...".
- **Implementation**:
  - Update `PostCard` and `MockSocialService` to include mock author profiles (Alice, Bob, Charlie) associated with feed posts.
  - Render the correct author name, DID, and avatar in the `PostCard`.

## Technical Actions
1. Add mock author profiles to the feed state.
2. Resolve `authorCid` in `PostCard`.
3. Implement `filter.type === 'peer'` in `SocialContext.tsx`.

**Next Step**: Create the formal implementation plan.
