# Plan: Transition to Tag-Based Channel Routing (Post v3)

## Objective
Remove the application-specific `channelId` field from the core `Post` and `Reply` schemas in favor of a generic `tags` based routing system. This simplifies the protocol while increasing flexibility for different application types.

## Strategy
1.  **Schema Evolution**: Introduce `Post v3` and `Reply v2` in Protobuf, removing the `channel_id` field.
2.  **Convention**: Define a standard tag prefix for channel routing (e.g., `c:` prefix, so a channel named "general" becomes the tag `c:general`).
3.  **Package Implementation**:
    *   Update `@vco/vco-schemas` to support the new versions.
    *   Update helper functions to automatically handle channel-to-tag conversion.
4.  **Application Migration**: Refactor `vco-cord` to use tags for message filtering and publication.
5.  **Backward Compatibility**: Ensure `vco-schemas` can still decode `v1` and `v2` objects but prefers `v3` for new content.

## Tasks

- [x] **Task 1: Update Protobuf Definitions (v3)**
    - [x] Modify `proto/vco/schemas/post.proto` to define `Post` without `channel_id`.
    - [x] Modify `proto/vco/schemas/social/reply.proto` to define `Reply` without `channel_id`.
    - [x] Run `npm run proto:gen` to update generated stubs.

- [x] **Task 2: Implement Post v3 in vco-schemas**
    - [x] Define `POST_V3_SCHEMA_URI` in `packages/vco-schemas/src/post.ts`.
    - [x] Update `PostData` interface: make `channelId` optional (for v1/v2 compatibility) and ensure `tags` is prioritized.
    - [x] Update `encodePost` and `decodePost` to handle v3 logic.

- [x] **Task 3: Implement Reply v2 in vco-schemas**
    - [x] Define `REPLY_V2_SCHEMA_URI` in `packages/vco-schemas/src/social/reply.ts`.
    - [x] Update `ReplyData` and encoding/decoding logic.

- [x] **Task 4: Refactor vco-cord for Tag-Based Routing**
    - [x] Update `useMessages.ts` to filter incoming messages based on the `c:` tag prefix.
    - [x] Update `buildMessage` in `lib/vco.ts` to use `Post v3` and add the appropriate channel tag.

- [x] **Task 5: Verification**
    - [x] Add unit tests in `vco-schemas` for v3 roundtrips.
    - [x] Update `vco-cord` tests to verify tag-based filtering.
    - [x] Final build check across the workspace.
