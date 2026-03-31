# Brainstorming: UI/UX Enhancements for VCO Social

**Objective**: Implement the missing core components and UX gaps identified during the UI Expert audit to elevate `vco-social` to a complete, interactive decentralized social application.

## 1. Missing Core Components

### 1.1 Thread & Reply View (`ThreadView.tsx`)
- **Concept**: A slide-over panel or modal that opens when a user clicks the "reply" or "message" icon on a `PostCard`.
- **Implementation**: 
  - Needs a way to display the parent post at the top.
  - An input area fixed at the bottom to compose a reply.
  - A list of reply posts.
  - **Schema Integration**: Use the existing `vco://schemas/social/reply/v1` or rely on the `Post` schema's `channelId`/`tags` for threading.

### 1.2 Media Gallery (`MediaGallery.tsx`)
- **Concept**: A responsive grid to display attached media CIDs within a `PostCard`.
- **Implementation**:
  - 1 item: Full width, aspect-video.
  - 2 items: Split 50/50.
  - 3 items: One large left, two stacked right.
  - 4 items: 2x2 grid.
  - Need a mock CID resolver that returns a placeholder image (since we are simulating the network).

### 1.3 Search Results Interface (`SearchOverlay.tsx`)
- **Concept**: A dropdown or modal attached to the header search bar.
- **Implementation**:
  - Show "Recent Searches".
  - Mock results for Users (Profiles) and Posts.
  - Clicking a result navigates or filters the feed.

### 1.4 Relationship Management (`FollowButton.tsx` & `PeerList.tsx`)
- **Concept**: Allow users to follow other peers.
- **Implementation**:
  - Create a `FollowButton` that toggles state (Follow/Unfollow).
  - Update `ProfileView` to show interactive Follower/Following lists.
  - **Schema Integration**: Utilize `FOLLOW_SCHEMA_URI`.

## 2. UX & Feedback Gaps

### 2.1 Toast Notifications (`ToastProvider.tsx`)
- **Concept**: A global toast system for transaction feedback.
- **Implementation**:
  - Create a context to trigger toasts.
  - Show toasts for: "Post Published", "DM Encrypted", "Profile Synced".
  - Use Framer Motion for slide-in/out animations.

### 2.2 Real-time Activity Visualization (`SwarmPulse.tsx`)
- **Concept**: A visual indicator in the header showing active syncs.
- **Implementation**:
  - Expand the existing "Network Active" pill to show a scrolling log of recent mock events.

### 2.3 Accessibility Audit Fixes
- **Action**: Add explicit `aria-label`s to all icon-only buttons in `PostCard` and `MessageView`.

## Technical Strategy
- Leverage `@vco/vco-ui` for base components where possible, but build specific layout components within `vco-social/src/components`.
- Update `MockSocialService` to provide data for the new features (e.g., mock replies, mock followers).

**Next Step**: Create the formal implementation plan.
