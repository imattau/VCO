# Brainstorming: The Role of `channelId` in VCO Post Schema

## Objective
Evaluate whether `channelId` belongs in the core `Post` schema or should be moved to a separate "Context" or "Routing" schema to ensure the protocol remains application-agnostic while supporting structured social features.

## Current State
The `Post` and `Reply` schemas (v1 and v2) both include a `channel_id` string field. This was primarily added to support `vco-cord` (a Discord-like application) but may be redundant or confusing for developers building different types of apps (e.g., a microblogging site where "channels" don't exist).

## Analysis

### Approach 1: Keep `channelId` in `Post` (Status Quo)
- **Pros**:
    - **Simplicity**: Single object contains all necessary info for common social apps.
    - **Performance**: Relays can index by channel without looking at other objects.
- **Cons**:
    - **Bloat**: Developers building apps without channels have a "ghost" field.
    - **Rigidity**: Assumes "Channel" is the primary organizational unit. What about "Circles", "Labels", or "Threads"?

### Approach 2: Abstract to a "Context" Envelope (Layered)
Instead of putting routing in the payload, use a wrapping or sidecar envelope pattern.
- **VCO Header**: Contains CreatorID, Type.
- **Context Layer**: A generic metadata layer that links a Content CID to a Context (e.g., `channel://...` or `topic://...`).
- **Pros**: Highly modular; `Post` becomes purely about content.
- **Cons**: Increases complexity for simple apps; requires resolving two objects to display one message.

### Approach 3: Use Tags for Routing (Recommended)
Leverage the recently added `tags` field in `Post v2` to handle channels.
- **Idea**: A "channel" is just a specific type of tag (e.g., `tag: "channel:general"`).
- **Pros**: 
    - **Consistency**: Uses the existing indexing infrastructure.
    - **Flexibility**: A post can belong to multiple channels/topics simultaneously.
    - **Generic**: The `Post` schema remains clean; `channel_id` is removed in favor of `tags`.
- **Cons**: Requires clients to agree on a tag prefix convention (e.g., `vco:channel:XYZ`).

### Approach 4: Dedicated Channel Membership Schema
Create a separate schema `vco://schemas/social/channel-membership/v1`.
- **Fields**: `post_cid`, `channel_cid`.
- **Pros**: Allows post-hoc channel assignment; very clean separation of concerns.
- **Cons**: Significant overhead; discovery becomes much harder (you have to find the membership object first).

## Proposed Architectural Direction: "The Tag-First Approach"
I propose **deprecating `channel_id` in a future Post v3** and moving routing logic into the `tags` field. 

1.  **Generic Content**: `Post` should only contain `content`, `media_cids`, and `timestamp`.
2.  **Contextual Metadata**: Organizational data (Channels, Topics, Circles) is handled via the `tags` array.
3.  **App-Specific Extensions**: If an app needs deeply complex channel logic (permissions, roles), they should use a dedicated `Channel` schema that posts reference.

## Next Steps
1.  **Research**: Check if `vco-relay` already indexes tags and if it can support prefix-based filtering.
2.  **Draft Post v3**: Remove `channel_id` and test if `vco-cord` can function using only tags for channel isolation.
3.  **Convention Doc**: Define a standard tag prefix for common routing (e.g., `#c:channel-name`).

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
