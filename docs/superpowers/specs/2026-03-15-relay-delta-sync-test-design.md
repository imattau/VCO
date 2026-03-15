# Relay Delta Sync Integration Test — Design Spec

**Date:** 2026-03-15
**Status:** Approved
**Scope:** `vco-relay` package

---

## Overview

Add an integration test that proves the VCO relay delivers only the *missing* envelopes (delta) to a connecting client, not the full set. The test drives a new bidirectional sync capability in the relay's sync-handler using Negentropy range-proof reconciliation.

---

## Architecture

### Components

| Component | Location | Change |
|---|---|---|
| `SyncResponder` | `vco-relay/src/sync-responder.ts` | **New** — Negentropy server role for the relay |
| `sync-handler.ts` | `vco-relay/src/sync-handler.ts` | **Extended** — gains a pull phase before the existing push/ingest phase |
| `delta-sync.test.ts` | `vco-relay/test/delta-sync.test.ts` | **New** — integration test |

### Protocol Flow (per session)

```
Client 2                          Relay
  │── connect (libp2p) ──────────►│
  │                               │  hydrate ReconciliationEngine
  │                               │  from store.allHeaderHashes()
  │── range proofs (round 1) ────►│
  │◄── range proofs (round 1) ────│
  │    [bisect / recurse] × N     │
  │── range proofs (final) ───────►│
  │◄── missing envelopes ─────────│  streams only delta
  │── new envelopes (push) ───────►│  existing ingest loop
  │── close ──────────────────────►│
```

Client 1's role: push N envelopes to the relay in test setup — no protocol changes required.

---

## Test Structure

**File:** `vco-relay/test/delta-sync.test.ts`

### Setup / Teardown

```
beforeEach:
  - Start RelayServer (tmp LevelDB dir, PoW difficulty = 0)
  - Create and start clientNode1, clientNode2 (createVcoLibp2pNode, TCP + QUIC)
  - client1 pushes 5 envelopes (A–E) to relay via existing push protocol
  - Wait for relay to persist all 5 (poll store.hasEnvelope or fixed delay)
  - Pre-seed client2's local in-memory store with envelopes {A, B, C}

afterEach:
  - Stop relay, clientNode1, clientNode2
  - Remove tmp LevelDB dir
```

### Test Cases

**Test 1 — Delta delivery:**
- client2 opens sync session with relay
- client2 runs `SyncExchangeOrchestrator` (initiator) with its 3-envelope set
- Relay `SyncResponder` identifies delta = {D, E}
- Assert: client2 receives exactly 2 envelopes
- Assert: received header hashes match D and E exactly

**Test 2 — Relay deduplication after sync:**
- client2 completes full delta sync (push phase sends A, B, C back to relay)
- Assert: relay store still contains exactly 5 envelopes (no duplicates)

**Test 3 — Client completeness:**
- client2 starts with {A, B, C}
- After sync completes: client2's local store contains {A, B, C, D, E}
- Assert: 5 envelopes, all header hashes present

---

## SyncResponder Design

**`vco-relay/src/sync-responder.ts`**

```typescript
// 1. Hydrate ReconciliationEngine from store.allHeaderHashes()
// 2. Loop (server-side Negentropy responder):
//    a. Receive client's range proofs
//    b. Build relay's range proofs for same ranges (RangeProofBuilder over store)
//    c. Send relay's range proofs
//    d. If roots all match → TERMINATED, break
//    e. If any range is unit → EXCHANGE, record missing hashes, break
// 3. For each hash in relay's set not reconciled to client's set:
//    a. Fetch envelope from store
//    b. Send encoded envelope to client
// 4. Send END sentinel so client knows the pull phase is complete
```

The `RangeProofBuilder` computes Merkle fingerprints over header hashes bucketed by the hash range (first byte of `headerHash`), consistent with `vco-sync`'s fingerprinting scheme.

---

## sync-handler Extension

Two-phase structure (backward-compatible):

```
handleSyncSession():
  1. [existing] Issue outbound PoW challenge if configured
  2. [NEW] Pull phase:
       Peek at first message kind via decodeSyncControlKind()
       If kind === "range_proof" → run SyncResponder, stream delta to client
       (If kind === raw envelope bytes → fall through, old-protocol client)
  3. [existing] Push phase:
       Loop: receive envelopes from client, validate, store
```

Backward-compatible: legacy clients that send raw envelopes first are handled by the existing push loop without change.

---

## Client-side Test Utilities

Client2's local store in tests: `Map<string, VcoEnvelope>` keyed by `toHex(headerHash)`.

The `RangeProofBuilder` for `SyncExchangeOrchestrator` on the client side reads from this map, computing the same Merkle fingerprinting as the relay.

---

## Out of Scope

- Changes to the Tauri/mobile `NodeClient` — this test operates at the libp2p/Node.js layer only
- PoW enforcement during delta sync pull phase (difficulty = 0 in tests)
- Streaming back to multiple clients simultaneously (fan-out)
