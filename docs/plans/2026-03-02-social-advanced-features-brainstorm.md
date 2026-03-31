# Brainstorming: Advanced Decentralized Features for VCO Social

**Objective**: Transition `vco-social` from a high-fidelity prototype to a functional decentralized social platform by implementing schema-backed interactions, real media hashing, and verifiable content lifecycle management.

## 1. Schema-Backed Interactions

### 1.1 Verifiable Reactions (Likes)
- **Schema**: `vco://schemas/social/reaction/v1`
- **Logic**: 
  - User clicks Heart icon -> Generate `Reaction` object containing target post CID and `type: LIKE`.
  - Publish to network (mocked in `SocialContext`).
  - Update UI state to reflect user's reaction.

### 1.2 Verifiable Deletion (Tombstones)
- **Schema**: `vco://schemas/social/tombstone/v1`
- **Logic**:
  - User selects "Delete" in `PostCard` menu -> Generate `Tombstone` object referencing the post CID.
  - Social layer must filter out any CID that has a valid Tombstone signed by the original creator.

### 1.3 Repost/Amplify
- **Status**: Need to verify if a `Repost` schema exists. If not, use a `Post` with a `reposted_cid` field or define a new simple schema.

## 2. Media Integration & Hashing

### 2.1 Real Media Upload Flow
- **Component**: `ComposePost.tsx`
- **Logic**:
  - Use a hidden `<input type="file">`.
  - On selection: Hash the file (mock hashing via `vco-testing` or real BLAKE3 if available).
  - Include the CID in the `Post` metadata.
  - Store the Blob in `MockNetworkStore` so `MediaGallery` can resolve it.

## 3. Dynamic Feed & Discovery

### 3.1 Global Search Filtering
- **Logic**: 
  - Add a `filter` state to `SocialContext`.
  - `SearchOverlay` updates the `filter` (e.g., a specific tag or creator DID).
  - `FeedView` renders a filtered version of the `feed` array.

### 3.2 Thread Reconstruction
- **Logic**:
  - `ThreadView` should scan the `feed` for any `Reply` or `Post` objects that have a `parentCid` matching the opened post.

## 4. Network Management

### 4.1 Settings View
- **Logic**:
  - Create `SettingsView.tsx`.
  - Allow viewing the local `PeerId` and configuring bootstrap multiaddresses.
  - Display "Sync Progress" or "Known Peers" list.

## Risks & Constraints
- **Complexity**: Implementing real-time bisection sync for threads is out of scope for this UI-focused task; we will rely on filtering the current local `feed` state.
- **Persistence**: Using `localStorage` for media blobs is not feasible; they will remain session-only for this prototype.

**Next Step**: Create the formal implementation plan.
