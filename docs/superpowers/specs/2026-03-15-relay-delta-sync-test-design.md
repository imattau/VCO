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
  │                               │  hydrate engine from
  │                               │  store.allHeaderHashes()
  │── range proofs (round 1) ────►│
  │◄── range proofs (round 1) ────│
  │    [bisect / recurse] × N     │
  │◄── missing envelopes ─────────│  raw encodeEnvelopeProto bytes
  │                               │  relay closes write side → EOF
  │── new envelopes (push) ───────►│  existing ingest loop
  │── close ──────────────────────►│
```

Client 1's role: push N envelopes to the relay in test setup — no protocol changes required on client 1's side.

---

## Test Structure

**File:** `vco-relay/test/delta-sync.test.ts`

### Setup / Teardown

```
beforeEach:
  - Start RelayServer (tmp LevelDB dir, PoW difficulty = 0)
  - Create and start clientNode1, clientNode2 (createVcoLibp2pNode, TCP + QUIC)
  - client1 pushes 5 envelopes (A–E) to relay via existing push protocol
  - Wait 300 ms for relay to persist all 5 (matches existing e2e.test.ts pattern)
  - Pre-seed client2's local in-memory store (Map<string, VcoEnvelope>) with {A, B, C}

afterEach:
  - Stop relay, clientNode1, clientNode2
  - Remove tmp LevelDB dir
```

### Test Cases

**Test 1 — Delta delivery:**
- client2 opens sync session with relay
- client2 runs `SyncExchangeOrchestrator` (initiator) with its 3-envelope set
- Relay `SyncResponder` identifies delta = {D, E}
- Assert: client2 receives exactly 2 envelopes via the pull phase
- Assert: received header hashes match D and E exactly

**Test 2 — Relay deduplication after sync:**
- client2 completes full delta sync (push phase sends A, B, C to relay)
- Assert: relay store still contains exactly 5 envelopes (no duplicates stored)

**Test 3 — Client completeness:**
- client2 starts with {A, B, C}
- After sync completes: client2's local store contains {A, B, C, D, E}
- Assert: 5 envelopes, all header hashes present

---

## SyncResponder Design

**`vco-relay/src/sync-responder.ts`**

The responder implements the server role of the Negentropy range-proof exchange. It does **not** use `SyncExchangeOrchestrator` (which is initiator-only). It loops, computing local Merkle roots and comparing them against what the client sends, until convergence:

```typescript
// 1. Hydrate local set from store.allHeaderHashes() into a sorted array
// 2. Loop (server-side Negentropy responder):
//    a. Receive client's range proofs (SyncRangeProofProtocol.receiveRangeProofs())
//    b. Build relay's range proofs for the same ranges using the fingerprint()
//       function from @vco/vco-sync, applied over the relay's sorted hash array
//    c. Send relay's range proofs (SyncRangeProofProtocol.sendRangeProofs())
//    d. Compare each pair of Merkle roots locally:
//       - If all roots match → both sets are identical, break
//       - If a range has a unit start==end → that range identifies a specific
//         hash the client is missing; record it, break
//       - Otherwise → continue loop with the bisected ranges from the client
// 3. For each recorded missing hash:
//    a. Fetch envelope from store (store.get(hash))
//    b. Send raw encodeEnvelopeProto(envelope) bytes to client via channel.send()
// 4. Close the write side of the channel (channel stream half-close)
//    Client interprets EOF on the read side as "pull phase complete"
//    and then begins the push phase (sending its new envelopes)
```

**Note on fingerprinting:** Both the relay's `SyncResponder` and the client-side `RangeProofBuilder` must use the same hash-bucketing scheme. Use the `fingerprint()` function exported from `@vco/vco-sync` (from `fingerprint.ts`) applied over header hashes bucketed by first byte into the `HashRange` bounds. This ensures Merkle root agreement when sets are equal.

**Note on termination:** `ReconciliationState` (`TERMINATED`, `EXCHANGE`, etc.) is local engine state — it is computed from Merkle root comparisons and is never transmitted over the wire. The responder determines its own termination condition by comparing its locally computed roots against the received client roots.

---

## sync-handler Extension

Two-phase structure (backward-compatible):

```
handleSyncSession():
  1. [existing] Issue outbound PoW challenge if configured
  2. [NEW] Pull phase:
       Receive first raw bytes from channel
       Try: decodeSyncControlKind(bytes)
         If kind === "range_proofs" → this is a new-protocol client
           Run SyncResponder with this first frame as round-1 client proofs
           Stream delta envelopes (raw encodeEnvelopeProto) to client
           Half-close write side → client knows pull phase is done
         Catch decode error → legacy client sending raw envelope bytes
           Fall through to push phase, treating bytes as the first envelope
  3. [existing] Push phase:
       Loop: receive envelopes from client, validate, store
```

**Backward-compatibility detail:** A legacy client sends `encodeEnvelopeProto` bytes as the first message. These are not valid `SyncControl` protobuf messages. `decodeSyncControlKind()` will throw on them. The `try/catch` around the peek call treats a decode error as the legacy-client signal and routes to the existing push loop, passing the already-received bytes as the first envelope.

---

## Client-side Test Utilities

**Client2's local store:** `Map<string, VcoEnvelope>` keyed by `toHex(headerHash)`.

**RangeProofBuilder for `SyncExchangeOrchestrator`:**
```typescript
const rangeProofBuilder: RangeProofBuilder = (range, _round) => {
  const hashes = [...client2Store.values()]
    .map(e => e.headerHash)
    .filter(h => h[0] >= range.start && h[0] <= range.end)
    .sort(/* lexicographic */);
  return { range, merkleRoot: fingerprint(hashes) };
};
```
Uses the same `fingerprint()` function from `@vco/vco-sync` as the relay, ensuring consistent Merkle roots across both sides.

**Received-envelope collector:** A plain array `received: VcoEnvelope[]` populated by the client reading raw bytes from the channel after range-proof convergence and before the push phase begins.

---

## Out of Scope

- Changes to the Tauri/mobile `NodeClient` — this test operates at the libp2p/Node.js layer only
- PoW enforcement during delta sync pull phase (difficulty = 0 in all tests)
- Fan-out to multiple simultaneous clients
- Proto schema changes — no new `SyncControl` fields needed; EOF signals pull-phase completion
