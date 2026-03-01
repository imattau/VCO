# Brainstorming: VCO Media Schema (Podcasting & Streaming)

**Objective**: Define a standard set of schemas for decentralized media delivery (podcasts, video, audio) on VCO v3.2, enabling parallel fetching, deduplication, and blind context subscriptions.

## 1. Media Manifest (Episode/Object Level)
This schema defines a single piece of content (e.g., a podcast episode).

**Proposed Fields:**
- `schema`: URI (e.g., `vco://schemas/media/manifest/v1`)
- `title`: UTF-8 string.
- `summary`: Short description.
- `show_notes`: Long-form Markdown content.
- `audio_chunks`: Array of CIDs (parallel fetching).
- `cover_art_cid`: CID pointing to an image object.
- `transcript_cid`: CID pointing to a time-coded transcript object (optional).
- `duration_ms`: Total playback time.
- `published_at_ms`: Unix timestamp.
- `parent_episode_cid`: CID of the previous episode (sequential history).
- `content_type`: MIME type hint (e.g., `audio/mpeg`).

## 2. Media Channel (Feed/Series Level)
This schema defines the "Head" of a series or channel.

**Proposed Fields:**
- `schema`: URI (e.g., `vco://schemas/media/channel/v1`)
- `name`: Channel name.
- `author`: Creator name/DID.
- `bio`: Channel description.
- `avatar_cid`: Channel logo.
- `latest_episode_cid`: Points to the most recent Media Manifest.
- `categories`: Array of tags (e.g., "Technology", "Privacy").
- `is_live`: Boolean flag for active streaming.

## 3. Streaming Optimization & Swarm Health
- **Deduplication**: Audio chunks representing intros/ads can be reused across different manifests.
- **Parallel Fetching**: Clients can pull chunks from different relays simultaneously based on the `audio_chunks` array.
- **PoW Requirements**: Relay policies can enforce `POW_ACTIVE` for media chunks to ensure "proof of interest."
- **Sync Integration**: Uses `vco-sync` to resolve "gaps" in the sequential episode chain.

## 4. Technical Constraints
- Each manifest must fit within the `MAX_VCO_SIZE` (4MB). If the list of audio chunks is massive (e.g., for 100-hour video), it should transition to a `SequenceManifest` tree.
- `audio_chunks` should ideally point to raw byte objects (0x00) or nested manifests.

**Recommendation**: Create `proto/vco/schemas/media/` and implement `manifest.proto` and `channel.proto`.
