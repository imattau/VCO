# Implementation Plan: Relay Delta Sync

**Date:** 2026-03-15
**Spec:** `docs/superpowers/specs/2026-03-15-relay-delta-sync-test-design.md`
**Test command:** `npm run test --workspace=packages/vco-relay`

---

## Overview

Add Negentropy range-proof reconciliation to the relay's sync handler so clients receive only
missing envelopes (delta), plus a full integration test proving correctness.

Three deliverables:
1. `packages/vco-relay/src/sync-responder.ts` — new file, relay-side Negentropy responder
2. `packages/vco-relay/src/sync-handler.ts` — extend with pull phase (backward-compatible)
3. `packages/vco-relay/test/delta-sync.test.ts` — new integration test (3 test cases)

---

## Task 1: SyncResponder

- [ ] **CREATE** `packages/vco-relay/src/sync-responder.ts`

### What it does

Implements the server (responder) role of the Negentropy range-proof exchange.
Hydrates its set from `store.allHeaderHashes()`, loops receiving client range proofs
and sending back relay range proofs, detects convergence by comparing Merkle roots,
collects missing hashes, fetches and streams those envelopes to the client, then
half-closes the write side to signal EOF (end of pull phase).

### Key imports

```typescript
import { encodeEnvelopeProto } from "@vco/vco-core";
import type { VcoEnvelope } from "@vco/vco-core";
import {
  SyncRangeProofProtocol,
  computeRangeFingerprint,
  type SyncMessageChannel,
} from "@vco/vco-sync";
import type { RangeProof } from "@vco/vco-sync";
import type { IRelayStore } from "./store.js";
```

### Full file content

```typescript
import { encodeEnvelopeProto } from "@vco/vco-core";
import {
  SyncRangeProofProtocol,
  computeRangeFingerprint,
  type SyncMessageChannel,
} from "@vco/vco-sync";
import type { RangeProof } from "@vco/vco-sync";
import type { IRelayStore } from "./store.js";

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

export class SyncResponder {
  private readonly protocol: SyncRangeProofProtocol;

  constructor(
    private readonly channel: SyncMessageChannel,
    private readonly store: IRelayStore,
  ) {
    this.protocol = new SyncRangeProofProtocol(channel);
  }

  async run(): Promise<void> {
    // 1. Hydrate local set from store
    const relayHashes: Uint8Array[] = [];
    for await (const hash of this.store.allHeaderHashes()) {
      relayHashes.push(hash);
    }

    const missingHexes = new Set<string>();

    // 2. Range-proof exchange loop (server role)
    while (true) {
      // Receive client's range proofs
      const clientProofs: RangeProof[] = await this.protocol.receiveRangeProofs();

      // Build relay's range proofs for the same ranges
      const relayProofs: RangeProof[] = await Promise.all(
        clientProofs.map(async (cp) => {
          const merkleRoot = await computeRangeFingerprint(cp.range, relayHashes);
          return { range: cp.range, merkleRoot };
        }),
      );

      // Send relay's proofs back
      await this.protocol.sendRangeProofs(relayProofs);

      // Compare roots to detect which ranges differ
      let allMatch = true;
      for (let i = 0; i < clientProofs.length; i++) {
        const clientRoot = clientProofs[i].merkleRoot;
        const relayRoot = relayProofs[i].merkleRoot;
        if (!arraysEqual(clientRoot, relayRoot)) {
          allMatch = false;
          const range = clientProofs[i].range;
          // Unit range (start === end) identifies a specific hash bucket
          if (range.start === range.end) {
            // Collect all relay hashes in this unit range that the client doesn't have
            for (const hash of relayHashes) {
              if (hash[0] === range.start) {
                missingHexes.add(toHex(hash));
              }
            }
          }
          // Non-unit range: client will bisect and send sub-ranges next round
        }
      }

      if (allMatch) {
        // Both sets are identical — no missing envelopes
        break;
      }

      // If all differing ranges were unit ranges, we've collected all missing hashes
      const allDiffAreUnit = clientProofs.every(
        (cp, i) =>
          arraysEqual(cp.merkleRoot, relayProofs[i].merkleRoot) ||
          cp.range.start === cp.range.end,
      );
      if (allDiffAreUnit) {
        break;
      }
      // Otherwise continue loop: client will send bisected sub-ranges
    }

    // 3. Stream missing envelopes to client
    for (const hex of missingHexes) {
      const hashBytes = Uint8Array.from(Buffer.from(hex, "hex"));
      const envelope = await this.store.get(hashBytes);
      if (envelope) {
        const encoded = encodeEnvelopeProto(envelope);
        await this.channel.send(encoded);
      }
    }

    // 4. Half-close write side — signals EOF (pull phase complete)
    // channel.close() ends the outbound pushable; client reads EOF
    // We do NOT call channel.close() here as that also closes the read side.
    // Instead we signal via a sentinel: send a zero-length Uint8Array as EOF marker.
    // The channel implementation does not support half-close directly, so we use
    // the convention that the push phase begins immediately after the relay stops
    // sending range proofs (client drives the transition by initiating push).
    // NOTE: The sync-handler will call channel.close() after the push phase ends.
  }
}
```

### Verification command

```bash
npm run typecheck --workspace=packages/vco-relay
```

---

## Task 2: Extend sync-handler.ts with Pull Phase

- [ ] **MODIFY** `packages/vco-relay/src/sync-handler.ts`

### What changes

Add a two-phase structure: before the existing push/ingest loop, attempt to decode the
first received bytes as a `SyncControl` range-proofs message. If it is `range_proofs`,
run `SyncResponder`. If decode throws (legacy raw-envelope client), fall through to the
existing push loop treating those bytes as the first envelope.

### Import additions

Add to imports at top of file:
```typescript
import { decodeSyncControlKind } from "@vco/vco-sync";
import { SyncResponder } from "./sync-responder.js";
```

### Modified `handleSyncSession` body

Replace the section after PoW challenge with:

```typescript
  // Phase 1 (pull): peek at first message to detect new-protocol client
  let firstEnvelopeBytes: Uint8Array | null = null;

  try {
    const firstBytes = await channel.receive();
    let kind: string;
    try {
      kind = decodeSyncControlKind(firstBytes);
    } catch {
      // Legacy client: first message is a raw envelope, not SyncControl
      firstEnvelopeBytes = firstBytes;
      kind = "raw_envelope";
    }

    if (kind === "range_proofs") {
      // New-protocol client: run the Negentropy responder
      // We need to replay firstBytes into the protocol.
      // SyncRangeProofProtocol.receiveRangeProofs() reads from channel,
      // so we wrap channel to replay firstBytes first.
      const replayChannel = new ReplayChannel(channel, firstBytes);
      const responder = new SyncResponder(replayChannel, store);
      await responder.run();
    }
  } catch (err: any) {
    if (
      err?.code === "ERR_STREAM_RESET" ||
      err?.message?.includes("closed") ||
      err?.message?.includes("reset") ||
      err?.message?.includes("aborted")
    ) {
      return; // Session ended before first message
    }
    process.stderr.write(`[vco-relay] sync-handler: phase detection error: ${err}\n`);
    return;
  }

  // Phase 2 (push): receive and ingest envelopes from client
  // If firstEnvelopeBytes is set, process it as first envelope before looping
  const processEnvelope = async (encoded: Uint8Array) => {
    try {
      const requiredDifficulty = inboundPolicy.getRequiredDifficulty();
      const envelope = decodeEnvelopeProto(encoded);
      const valid = await core.validateEnvelope(envelope, { powDifficulty: requiredDifficulty });
      if (!valid) return;

      if (!await store.hasEnvelope(envelope.headerHash)) {
        await store.put(envelope);

        if (config.maxStoreSizeMb > 0) {
          const worstHash = await store.worstEnvelopeHash();
          if (worstHash) {
            const worstEnv = await store.get(worstHash);
            if (worstEnv) {
              const worstPriority = worstEnv.header.priorityHint ?? 1;
              const thisPriority = envelope.header.priorityHint ?? 1;

              if (worstPriority < thisPriority) {
                await store.evict(worstHash);
              } else if (worstPriority === thisPriority) {
                const worstScore = getPowScore(worstHash);
                const thisScore = getPowScore(envelope.headerHash);
                if (worstScore < thisScore) {
                  await store.evict(worstHash);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      process.stderr.write(`[vco-relay] sync-handler: envelope decode/validate/store error: ${err}\n`);
    }
  };

  if (firstEnvelopeBytes) {
    await processEnvelope(firstEnvelopeBytes);
  }

  while (true) {
    let encoded: Uint8Array;
    try {
      encoded = await channel.receive();
    } catch (err: any) {
      if (
        err?.code === "ERR_STREAM_RESET" ||
        err?.message?.includes("closed") ||
        err?.message?.includes("reset") ||
        err?.message?.includes("aborted")
      ) {
        break;
      }
      process.stderr.write(`[vco-relay] sync-handler: unexpected receive error: ${err}\n`);
      break;
    }
    await processEnvelope(encoded);
  }
```

Also add `ReplayChannel` class (before or after `handleSyncSession`):

```typescript
class ReplayChannel {
  private replayed = false;
  constructor(
    private readonly inner: SyncMessageChannel,
    private readonly firstMessage: Uint8Array,
  ) {}

  async send(payload: Uint8Array): Promise<void> {
    return this.inner.send(payload);
  }

  async receive(): Promise<Uint8Array> {
    if (!this.replayed) {
      this.replayed = true;
      return this.firstMessage;
    }
    return this.inner.receive();
  }
}
```

### Verification command

```bash
npm run typecheck --workspace=packages/vco-relay
```

---

## Task 3: Delta Sync Integration Test

- [ ] **CREATE** `packages/vco-relay/test/delta-sync.test.ts`

### Test structure

Three test cases under `describe("Relay Delta Sync")`:
1. Client2 receives only the 2 missing envelopes (D, E)
2. Relay deduplication — store still has exactly 5 envelopes after client2 push
3. Client2 ends up with all 5 envelopes

### Full file content

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RelayServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createVcoLibp2pNode, openSyncSessionChannel } from "@vco/vco-transport";
import { tcp } from "@libp2p/tcp";
import { quic } from "@chainsafe/libp2p-quic";
import { NobleCryptoProvider, deriveEd25519Multikey } from "@vco/vco-crypto";
import {
  createEnvelope,
  encodeEnvelopeProto,
  decodeEnvelopeProto,
  type VcoEnvelope,
} from "@vco/vco-core";
import {
  SyncRangeProofProtocol,
  computeRangeFingerprint,
} from "@vco/vco-sync";
import type { RangeProof } from "@vco/vco-sync";

const crypto = new NobleCryptoProvider();
const PRIVATE_KEY = new Uint8Array(32).fill(0x77);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEnvelope(payloadText: string): Promise<VcoEnvelope> {
  return createEnvelope(
    {
      payload: new TextEncoder().encode(payloadText),
      payloadType: 1,
      creatorId: CREATOR_ID,
      privateKey: PRIVATE_KEY,
    },
    crypto,
  );
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

function makeConfig(dir: string) {
  return loadConfig({
    configPath: undefined,
    env: {
      VCO_DATA_DIR: dir,
      VCO_LISTEN_ADDRS: "/ip4/127.0.0.1/udp/0/quic-v1,/ip4/127.0.0.1/tcp/0",
    },
  });
}

let tmpDir: string;
let server: RelayServer;
let clientNode1: Awaited<ReturnType<typeof createVcoLibp2pNode>>;
let clientNode2: Awaited<ReturnType<typeof createVcoLibp2pNode>>;
let envelopes: VcoEnvelope[];  // [A, B, C, D, E]
let client2Store: Map<string, VcoEnvelope>;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-delta-"));
  server = new RelayServer(makeConfig(tmpDir));
  await server.start();

  clientNode1 = await createVcoLibp2pNode({
    addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1", "/ip4/127.0.0.1/tcp/0"] },
    transports: [tcp(), quic()],
  });
  clientNode2 = await createVcoLibp2pNode({
    addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1", "/ip4/127.0.0.1/tcp/0"] },
    transports: [tcp(), quic()],
  });
  await clientNode1.start();
  await clientNode2.start();

  // Create 5 distinct envelopes A–E
  envelopes = await Promise.all([
    makeEnvelope("envelope-A"),
    makeEnvelope("envelope-B"),
    makeEnvelope("envelope-C"),
    makeEnvelope("envelope-D"),
    makeEnvelope("envelope-E"),
  ]);

  // client1 pushes all 5 envelopes to relay
  const serverAddr = server.multiaddrs[0];
  const conn1 = await clientNode1.dial(serverAddr);
  const ch1 = await openSyncSessionChannel(conn1);
  for (const env of envelopes) {
    await ch1.send(encodeEnvelopeProto(env));
  }
  await ch1.close();

  // Wait for relay to persist all 5
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Pre-seed client2 with {A, B, C}
  client2Store = new Map<string, VcoEnvelope>();
  for (const env of envelopes.slice(0, 3)) {
    client2Store.set(toHex(env.headerHash), env);
  }
}, 30000);

afterEach(async () => {
  await clientNode1.stop();
  await clientNode2.stop();
  await server.stop();
  rmSync(tmpDir, { recursive: true });
}, 30000);

describe("Relay Delta Sync", () => {
  it("client2 receives only the 2 missing envelopes (D, E)", async () => {
    const received: VcoEnvelope[] = [];
    const serverAddr = server.multiaddrs[0];
    const conn2 = await clientNode2.dial(serverAddr);
    const channel = await openSyncSessionChannel(conn2);
    const protocol = new SyncRangeProofProtocol(channel);

    // Build initial range proofs covering [0x00, 0xff] full range
    const client2Hashes = [...client2Store.values()].map((e) => e.headerHash);
    const fullRange = { start: 0x00, end: 0xff };
    const initialRoot = await computeRangeFingerprint(fullRange, client2Hashes);
    const initialProofs: RangeProof[] = [{ range: fullRange, merkleRoot: initialRoot }];

    // Send initial range proofs to relay
    await protocol.sendRangeProofs(initialProofs);

    // Receive relay's range proofs back
    let relayProofs = await protocol.receiveRangeProofs();

    // Compare roots — if they differ, bisect and continue until all unit ranges resolved
    while (true) {
      const diffRanges: RangeProof[] = [];
      let anyDiff = false;

      for (const rp of relayProofs) {
        const clientRoot = await computeRangeFingerprint(rp.range, client2Hashes);
        if (!clientRoot.every((b, i) => b === rp.merkleRoot[i])) {
          anyDiff = true;
          if (rp.range.start === rp.range.end) {
            // Unit range — we know the relay has something we don't; stop bisecting
            // We'll receive the missing envelopes after convergence
          } else {
            // Bisect
            const mid = Math.floor((rp.range.start + rp.range.end) / 2);
            const leftRoot = await computeRangeFingerprint({ start: rp.range.start, end: mid }, client2Hashes);
            const rightRoot = await computeRangeFingerprint({ start: mid + 1, end: rp.range.end }, client2Hashes);
            diffRanges.push(
              { range: { start: rp.range.start, end: mid }, merkleRoot: leftRoot },
              { range: { start: mid + 1, end: rp.range.end }, merkleRoot: rightRoot },
            );
          }
        }
      }

      if (!anyDiff || diffRanges.length === 0) break;

      await protocol.sendRangeProofs(diffRanges);
      relayProofs = await protocol.receiveRangeProofs();
    }

    // Read missing envelopes until channel closes (EOF = pull phase complete)
    while (true) {
      let bytes: Uint8Array;
      try {
        bytes = await channel.receive();
      } catch {
        break; // EOF — relay closed write side
      }
      try {
        const env = decodeEnvelopeProto(bytes);
        received.push(env);
        client2Store.set(toHex(env.headerHash), env);
      } catch {
        break; // Not an envelope — stop
      }
    }

    expect(received).toHaveLength(2);
    const receivedHexes = new Set(received.map((e) => toHex(e.headerHash)));
    expect(receivedHexes.has(toHex(envelopes[3].headerHash))).toBe(true); // D
    expect(receivedHexes.has(toHex(envelopes[4].headerHash))).toBe(true); // E

    await channel.close();
  }, 30000);

  it("relay deduplication — store still has exactly 5 envelopes after client2 push phase", async () => {
    // client2 connects, does delta sync, then pushes A, B, C (which relay already has)
    const serverAddr = server.multiaddrs[0];
    const conn2 = await clientNode2.dial(serverAddr);
    const channel = await openSyncSessionChannel(conn2);
    const protocol = new SyncRangeProofProtocol(channel);

    const client2Hashes = [...client2Store.values()].map((e) => e.headerHash);
    const fullRange = { start: 0x00, end: 0xff };
    const initialRoot = await computeRangeFingerprint(fullRange, client2Hashes);
    await protocol.sendRangeProofs([{ range: fullRange, merkleRoot: initialRoot }]);

    // Drain relay range proofs (simplified — just read until non-range-proof)
    try {
      await protocol.receiveRangeProofs();
    } catch { /* ignore */ }

    // Drain missing envelopes
    while (true) {
      let bytes: Uint8Array;
      try {
        bytes = await channel.receive();
      } catch { break; }
      try { decodeEnvelopeProto(bytes); } catch { break; }
    }

    // Push phase: client2 sends its 3 envelopes (relay already has them)
    for (const env of envelopes.slice(0, 3)) {
      await channel.send(encodeEnvelopeProto(env));
    }
    await channel.close();

    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = server.storeForTest!;
    const hashes: Uint8Array[] = [];
    for await (const h of store.allHeaderHashes()) hashes.push(h);
    expect(hashes).toHaveLength(5);
  }, 30000);

  it("client2 ends up with all 5 envelopes after delta sync", async () => {
    const serverAddr = server.multiaddrs[0];
    const conn2 = await clientNode2.dial(serverAddr);
    const channel = await openSyncSessionChannel(conn2);
    const protocol = new SyncRangeProofProtocol(channel);

    const client2Hashes = [...client2Store.values()].map((e) => e.headerHash);
    const fullRange = { start: 0x00, end: 0xff };
    const initialRoot = await computeRangeFingerprint(fullRange, client2Hashes);
    await protocol.sendRangeProofs([{ range: fullRange, merkleRoot: initialRoot }]);

    // Simplified exchange: receive relay proofs, drain missing envelopes
    try {
      await protocol.receiveRangeProofs();
    } catch { /* ignore */ }

    while (true) {
      let bytes: Uint8Array;
      try {
        bytes = await channel.receive();
      } catch { break; }
      try {
        const env = decodeEnvelopeProto(bytes);
        client2Store.set(toHex(env.headerHash), env);
      } catch { break; }
    }

    await channel.close();

    expect(client2Store.size).toBe(5);
    for (const env of envelopes) {
      expect(client2Store.has(toHex(env.headerHash))).toBe(true);
    }
  }, 30000);
});
```

### Verification command

```bash
npm run test --workspace=packages/vco-relay
```

---

## Execution Order

1. Write `sync-responder.ts` → typecheck → fix errors
2. Modify `sync-handler.ts` → typecheck → fix errors
3. Write `delta-sync.test.ts`
4. Run tests: `npm run test --workspace=packages/vco-relay`
5. Fix failures iteratively
6. Commit: `feat(vco-relay): add SyncResponder and delta-sync integration test`

---

## Key API Facts (from source reading)

- `computeRangeFingerprint(range: HashRange, hashes: readonly Uint8Array[], options?): Promise<Uint8Array>` — exported from `@vco/vco-sync` (fingerprint.ts)
- `SyncRangeProofProtocol` — in `@vco/vco-sync` (protocol.ts); `receiveRangeProofs()` reads from channel, `sendRangeProofs()` writes
- `decodeSyncControlKind(bytes)` — exported from `@vco/vco-sync` (wire.ts); throws if not a valid SyncControl
- `IRelayStore.allHeaderHashes()` — `AsyncIterable<Uint8Array>`
- `IRelayStore.get(hash)` — `Promise<VcoEnvelope | undefined>`
- `Libp2pSessionChannel.close()` — ends outbound pushable + closes stream (both directions)
- `channel.receive()` throws when stream ends — use try/catch to detect EOF
- `server.storeForTest` — exposed on `RelayServer` for test introspection (already used in e2e.test.ts)
- No half-close API on `Libp2pSessionChannel` — use try/catch on receive to detect relay closure
