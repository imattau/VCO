# Plan: UI/UX Enhancements for VCO Social

## Objective
Implement missing social features (Threads, Media Gallery, Search, Following) and improve user feedback (Toasts, Activity Pulse) based on the UI Expert audit.

## Tasks

### 1. UX Feedback & Accessibility Foundations
- [ ] Task 1.1: Fix WCAG accessibility issues (missing `aria-labels`) in `PostCard.tsx`, `ComposePost.tsx`, and `MessageView.tsx`.
- [ ] Task 1.2: Implement `ToastProvider.tsx` for global transaction feedback.
- [ ] Task 1.3: Integrate Toast feedback into `SocialContext.tsx` actions (Post, DM, Profile Save).

### 2. Core Social Components
- [ ] Task 2.1: Implement `MediaGallery.tsx` to handle 1-4 mock images and integrate it into `PostCard.tsx`.
- [ ] Task 2.2: Implement `ThreadView.tsx` as a slide-over modal to show a post and its replies.
- [ ] Task 2.3: Integrate `ThreadView` into `PostCard` (click to expand).

### 3. Relationship & Discovery
- [ ] Task 3.1: Implement `FollowButton.tsx` to handle Follow/Unfollow schemas.
- [ ] Task 3.2: Update `ProfileView.tsx` to show followers/following and integrate the `FollowButton`.
- [ ] Task 3.3: Implement `SearchOverlay.tsx` in the main header for peer and hashtag discovery.

### 4. Verification
- [ ] Task 4.1: Run `typecheck` to ensure no TypeScript regressions.
- [ ] Task 4.2: Build the `vco-social` app to verify CSS and Tailwind compilation.

## References
- `docs/plans/2026-03-02-social-ui-enhancements-brainstorm.md`
- `@vco/vco-schemas` (Follow, Post, Reply schemas)
