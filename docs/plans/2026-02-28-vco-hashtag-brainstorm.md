# Brainstorming: Hashtags in the VCO Protocol

## Objective
Determine the best way to implement hashtags (or generic tagging) in the VCO protocol to enable discovery, indexing, and community organization.

## Approach Comparison

### 1. Text-Only Extraction (Status Quo)
Clients parse hashtags (e.g., `#vco`) directly from the `content` string of `Post` or `Reply` objects.
- **Pros**: No schema changes required; familiar to users.
- **Cons**: Ambiguous extraction logic (regex variants); no structured metadata for relays to index efficiently without full-text search.

### 2. Structured Metadata (Recommended)
Add an explicit `repeated string tags` field to the `Post` and `Reply` Protobuf messages.
- **Pros**: Explicit intent; highly efficient for relay indexing; supports non-textual tags (e.g., machine-readable categories).
- **Cons**: Requires updating existing schema definitions (e.g., `vco://schemas/social/post/v2`).

### 3. Dedicated "Tagging" Object
Create a new schema `vco://schemas/social/tag/v1` that references another object by its CID and assigns a tag.
- **Pros**: Allows "collaborative tagging" (tagging someone else's post); tagging can happen after a post is signed.
- **Cons**: Significant increase in envelope count; complexity in verifying "who has the right to tag what."

### 4. Global "Hashtag" Registry Object
A verifiable object that represents the hashtag itself (e.g., ownership, description, or rules for a specific community hashtag like `#vco-dev`).
- **Pros**: Enables "community-owned" tags or channels.
- **Cons**: High complexity; likely a separate feature from simple post tagging.

## Use Cases
- **Discovery**: Relays can serve streams of objects filtered by tag.
- **Filtering**: Clients can mute specific tags.
- **Interoperability**: Standardized tags allow different VCO apps (e.g., `vco-cord` vs `vco-desktop`) to share topic spaces.

## Next Steps / Strategy
1.  **Draft a `Post v2` Schema**: Include a `repeated string tags` field.
2.  **Universal Tagger**: Implement a utility in `@vco/vco-schemas` that extracts tags from text but also populates the structured field.
3.  **Relay Indexing**: Update `vco-relay` to index tags found in the envelope payload.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
