# Plan: Structured Hashtag Support (Post v2)

## Objective
Introduce structured hashtag support to the VCO social schemas by adding a `tags` field to the `Post` and `Reply` Protobuf messages and implementing the corresponding logic in the `vco-schemas` package.

## Strategy
1.  **Schema Evolution**: Update the Protobuf definitions to include `repeated string tags`.
2.  **Code Generation**: Regenerate the JS/TS stubs using the existing `proto:gen` script.
3.  **Package Implementation**: 
    *   Update `packages/vco-schemas` to support both `v1` and `v2` versions of the Post schema.
    *   Implement a "tag extractor" utility to automatically populate the `tags` field from text content (e.g., `#hash`).
4.  **Verification**: Add unit tests for roundtrip serialization of posts with tags.

## Tasks

- [x] **Task 1: Update Protobuf Definitions**
    - [x] Add `repeated string tags = 6;` to `proto/vco/schemas/post.proto`.
    - [x] Add `repeated string tags = 7;` to `proto/vco/schemas/social/reply.proto`.
    - [x] Run `npm run proto:gen` to update generated stubs.

- [x] **Task 2: Implement Post v2 in vco-schemas**
    - [x] Define `POST_V2_SCHEMA_URI` in `packages/vco-schemas/src/post.ts`.
    - [x] Update `PostData` interface to include `tags?: string[]`.
    - [x] Update `encodePost` and `decodePost` to handle the new field.
    - [x] Implement `extractHashtags(text: string): string[]` utility.

- [x] **Task 3: Update Reply Schema**
    - [x] Update `ReplyData` interface in `packages/vco-schemas/src/social/reply.ts`.
    - [x] Update `encodeReply` and `decodeReply` to handle `tags`.

- [x] **Task 4: Add Verification Tests**
    - [x] Add a new test file `packages/vco-schemas/src/__tests__/hashtags.test.ts`.
    - [x] Verify that tags are correctly preserved during encoding/decoding.
    - [x] Verify that the auto-extractor correctly identifies tags like `#vco` and `#crypto`.

- [ ] **Task 5: Documentation Update**
    - [ ] Update the API documentation to reflect the new schema fields and versions.
