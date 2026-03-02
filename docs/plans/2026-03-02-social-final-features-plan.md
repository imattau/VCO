# Plan: Finalizing Social Features

## Objective
Resolve the remaining TODOs, implement peer-based feed filtering, and dynamically resolve post authors in the UI to finalize the `vco-social` feature set.

## Tasks

### 1. Feed Data Structure Update
- [ ] Task 1.1: Update the feed state definition in `SocialContext.tsx` to include `authorProfile` alongside `cid` and `data`.
- [ ] Task 1.2: Update `MockSocialService.ts` to attach mock author profiles (e.g., "Crypto Charlie", "Verifiable Bob") to the initial feed items.

### 2. Peer Filtering Implementation
- [ ] Task 2.1: Resolve the `// TODO: peer filter logic` in `SocialContext.tsx`. Filter the feed based on `item.authorProfile.displayName`.
- [ ] Task 2.2: Ensure the new post creation logic in `SocialContext.tsx` attaches the current user's `profile` to the new feed item.

### 3. UI Component Updates
- [ ] Task 3.1: Update `PostCard.tsx` to accept and render dynamic author data (avatar, display name, DID) instead of hardcoded values.
- [ ] Task 3.2: Update `ThreadView.tsx` to dynamically render author information for the parent post and simulated replies.

### 4. Verification
- [ ] Task 4.1: Run `typecheck` to ensure the new state structures are valid.
- [ ] Task 4.2: Build the project and test the peer search filtering workflow in the UI.

## References
- `packages/vco-social/src/features/SocialContext.tsx`
- `packages/vco-social/src/features/feed/PostCard.tsx`
