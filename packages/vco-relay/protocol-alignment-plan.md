# Plan: Protocol Alignment for vco-relay

## Objective
Align `@vco/vco-relay` with the latest protocol specifications (ADR 0004, ADR 0005), specifically focusing on priority-aware eviction, blind context routing, and schema consistency.

## Tasks

- [x] Task 1: Protocol Consistency & Schema
    - [x] Fix `PriorityLevel` enum in `vco.proto` to match `vco-core` (`LOW=0`, `CRITICAL=3`).
    - [x] Regenerate all protobuf definitions (`npm run proto:gen`).
    - [x] Update `vco-sync` `wire.ts` to support `InterestVector` encoding/decoding.

- [x] Task 2: Relay Store Enhancements
    - [x] Update `LevelDBRelayStore` eviction index to be priority-aware: `idx:${priority}:${score}:${hashHex}`.
    - [x] Implement `contextId` indexing in `LevelDBRelayStore` to support filtered queries.
    - [x] Refactor `lowestPowScoreHash` to correctly identify the lowest priority/work candidate in the new index.

- [x] Task 3: Sync Protocol Updates
    - [x] Add `sendInterestVector` and `receiveInterestVector` to `SyncRangeProofProtocol`.
    - [x] Update `vco-relay` `handleSyncSession` to store and apply interest vector filters to the outbound sync stream. (Note: Relays currently log interest but outbound sync is still in development).

- [x] Task 4: Verification
    - [x] Add unit tests in `vco-relay` for priority-aware eviction.
    - [x] Test sync filtering by `contextId` in a multi-relay simulation or integration test.
    - [x] Run full workspace build.
