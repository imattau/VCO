# Plan: Advanced Features Implementation for VCO Social

## Objective
Implement schema-backed interactions (Reactions, Reposts, Tombstones), real media hashing, dynamic search filtering, and network settings.

## Tasks

### 1. Schema & Infrastructure Extensions
- [ ] Task 1.1: Create `proto/vco/schemas/social/repost.proto` and update `generate-proto.mjs`.
- [ ] Task 1.2: Implement `Repost` TypeScript wrapper in `vco-schemas`.
- [ ] Task 1.3: Update `SocialContext.tsx` to handle `filter` state and `Tombstone` processing.

### 2. Media Publishing & Hashing
- [ ] Task 2.1: Update `ComposePost.tsx` to support real file selection and preview.
- [ ] Task 2.2: Implement "Hashing" logic in `FeedService.ts` to generate CIDs for real media blobs.
- [ ] Task 2.3: Update `MediaGallery.tsx` to resolve real `blob:` URLs from the testing store.

### 3. Schema-Backed Interactions
- [ ] Task 3.1: Wire up "Like" button in `PostCard` to publish `Reaction` manifests.
- [ ] Task 3.2: Wire up "Repost" button in `PostCard` to publish `Repost` manifests.
- [ ] Task 3.3: Implement "Delete" action in `PostCard` more menu using `Tombstone` schema.

### 4. Dynamic Feed & Discovery
- [ ] Task 4.1: Implement real feed filtering in `FeedView.tsx` based on `SocialContext` filter.
- [ ] Task 4.2: Update `ThreadView.tsx` to dynamically find replies in the feed state.
- [ ] Task 4.3: Add "Reporting" dialog to `PostCard` using `Report` schema.

### 5. Network Settings
- [ ] Task 5.1: Create `SettingsView.tsx` with node Multiaddr and PeerID info.
- [ ] Task 5.2: Integrate `SettingsView` into the sidebar navigation.

### 6. Verification
- [ ] Task 6.1: Build and typecheck the workspace.
- [ ] Task 6.2: Verify media upload and playback cycle.

## References
- `docs/plans/2026-03-02-social-advanced-features-brainstorm.md`
- `packages/vco-schemas/src/social/tombstone.ts`
