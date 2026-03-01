# Brainstorming: VCO Podcaster README

**Objective**: Create a professional, comprehensive README for the `vco-podcaster` application that serves as both a user guide and technical documentation for the media schema integration.

## Content Pillars

### 1. App Overview & Vision
- Decentralized, unblockable media delivery.
- "Healthy Swarm" concept: parallel fetching and deduplication.
- Privacy-first: Subscription without surveillance.

### 2. Core Features (UI Expert Guidance)
- **Consumer Feed**: High-fidelity dark theme, sequential episode discovery.
- **Integrated Player**: Persistent mini-player with real media playback via blob URLs.
- **Creator Studio**: Functional profile management and media publishing.
- **Onboarding**: "Start Your Swarm" channel creation flow.

### 3. Technical Implementation (Protocol Alignment)
- **MediaManifest**: How metadata and content CIDs are structured.
- **MediaChannel**: Decentralized feed management without RSS.
- **Sequential Linking**: The `previousItemCid` chain for verifiable history.
- **Parallel Fetching Concept**: How the schema enables chunk-based delivery.

### 4. Security & Hardening (Security Expert Guidance)
- **XSS Protection**: Markdown sanitization for show notes.
- **MIME Validation**: Restricting uploads to valid media types.
- **Memory Management**: Proper revocation of `blob:` URLs.

### 5. Developer Guide
- Installation and dependency management.
- Build and verification commands.
- Mock service architecture.

## Visual Language
- Use emojis for readability.
- Code blocks for schema URIs and protocol constants.
- Clear headings and sub-headings.

**Recommendation**: Proceed to Planning.
