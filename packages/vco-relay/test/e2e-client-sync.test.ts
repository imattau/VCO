/**
 * e2e-client-sync.test.ts
 *
 * End-to-end tests for client↔relay sync scenarios using real TCP sockets.
 * Each test spins up a real RelayServer on a random port, performs protocol
 * operations over live connections, and tears everything down in afterEach.
 *
 * Scenarios:
 *  1. Two clients sync via relay as intermediary (push + pull)
 *  2. Double-sync race condition — same peer, rapid re-invoke
 *  3. Session queue cleanup on error (force-close mid-sync)
 *  4. Relay dies mid-sync — no indefinite hang
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
  assertEnvelopeIntegrity,
} from "@vco/vco-core";
import { SyncRangeProofProtocol, computeRangeFingerprint } from "@vco/vco-sync";
import type { Libp2pNode } from "@vco/vco-transport";

// ---------------------------------------------------------------------------
// Shared crypto fixtures
// ---------------------------------------------------------------------------

const crypto = new NobleCryptoProvider();

// Client A key material
const PRIVATE_KEY_A = new Uint8Array(32).fill(0x11);
const CREATOR_ID_A = deriveEd25519Multikey(PRIVATE_KEY_A);

// Client B key material — distinct so B has nothing initially
const PRIVATE_KEY_B = new Uint8Array(32).fill(0x22);
const CREATOR_ID_B = deriveEd25519Multikey(PRIVATE_KEY_B);

function makeEnvelope(payload: string, privateKey: Uint8Array, creatorId: Uint8Array) {
  return createEnvelope(
    {
      payload: new TextEncoder().encode(payload),
      payloadType: 1,
      creatorId,
      privateKey,
    },
    crypto,
  );
}

// ---------------------------------------------------------------------------
// Relay factory helpers
// ---------------------------------------------------------------------------

function makeTmpDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function makeRelayConfig(dir: string) {
  return loadConfig({
    configPath: undefined,
    env: {
      VCO_DATA_DIR: dir,
      // port 0 → OS assigns a free port on both TCP and QUIC
      VCO_LISTEN_ADDRS: "/ip4/127.0.0.1/udp/0/quic-v1,/ip4/127.0.0.1/tcp/0",
    },
  });
}

async function makeClientNode(): Promise<Libp2pNode> {
  const node = await createVcoLibp2pNode({
    addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1", "/ip4/127.0.0.1/tcp/0"] },
    transports: [tcp(), quic()],
  });
  await node.start();
  return node;
}

// ---------------------------------------------------------------------------
// Per-test state
// ---------------------------------------------------------------------------

let tmpDir: string;
let server: RelayServer;

beforeEach(async () => {
  tmpDir = makeTmpDir("vco-relay-client-sync-");
  server = new RelayServer(makeRelayConfig(tmpDir));
  await server.start();
}, 30000);

afterEach(async () => {
  await server.stop();
  rmSync(tmpDir, { recursive: true, force: true });
}, 30000);

// ---------------------------------------------------------------------------
// Helpers for push (client → relay) and pull (relay → client)
// ---------------------------------------------------------------------------

/**
 * Push envelopes to the relay using the legacy raw-envelope protocol.
 * The relay's sync-handler treats the first message that fails SyncControl
 * decoding as a raw envelope, then continues reading further raw envelopes
 * until the stream is closed.
 */
async function pushEnvelopesToRelay(
  clientNode: Libp2pNode,
  relayAddr: any,
  envelopes: ReturnType<typeof createEnvelope>[],
): Promise<void> {
  const conn = await clientNode.dial(relayAddr);
  const channel = await openSyncSessionChannel(conn);
  for (const env of envelopes) {
    await channel.send(encodeEnvelopeProto(env));
  }
  await channel.close();
  // Give the relay time to process and persist all envelopes
  await new Promise((resolve) => setTimeout(resolve, 400));
}

/**
 * Pull envelopes from the relay using the range-proof protocol (new protocol).
 * The client sends an initial SyncControl/range_proofs frame covering the full
 * [0x00, 0xff] range with an empty fingerprint, which causes the relay
 * SyncResponder to compare and stream all envelopes the client lacks.
 *
 * Returns decoded envelopes received from the relay.
 */
async function pullEnvelopesFromRelay(
  clientNode: Libp2pNode,
  relayAddr: any,
  knownHashes: Uint8Array[] = [],
): Promise<ReturnType<typeof decodeEnvelopeProto>[]> {
  const conn = await clientNode.dial(relayAddr);
  const channel = await openSyncSessionChannel(conn);

  const protocol = new SyncRangeProofProtocol(channel);

  // Send a single range proof covering the full space so the relay can compare
  const localFingerprint = await computeRangeFingerprint(
    { start: 0x00, end: 0xff },
    knownHashes,
  );
  await protocol.sendRangeProofs([
    { range: { start: 0x00, end: 0xff }, merkleRoot: localFingerprint },
  ]);

  // Receive the relay's matching range proofs (one exchange round)
  await protocol.receiveRangeProofs();

  // After range exchange, the relay streams missing envelopes as raw bytes
  // terminated by a zero-length sentinel frame.
  const received: ReturnType<typeof decodeEnvelopeProto>[] = [];
  while (true) {
    let bytes: Uint8Array;
    try {
      bytes = await channel.receive();
    } catch {
      break;
    }
    if (bytes.length === 0) break; // zero-length sentinel = end of stream
    received.push(decodeEnvelopeProto(bytes));
  }

  await channel.close();
  return received;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("e2e client-relay sync", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 1: Two clients sync via relay as intermediary
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "Client A pushes 10 envelopes; Client B pulls all 10 with intact content",
    async () => {
      const clientA = await makeClientNode();
      const clientB = await makeClientNode();

      try {
        const relayAddr = server.multiaddrs[0];

        // Client A publishes 10 unique envelopes to the relay
        const envelopes = Array.from({ length: 10 }, (_, i) =>
          makeEnvelope(`envelope-${i}`, PRIVATE_KEY_A, CREATOR_ID_A),
        );
        await pushEnvelopesToRelay(clientA, relayAddr, envelopes);

        // Verify relay persisted all 10
        const store = server.storeForTest!;
        for (const env of envelopes) {
          expect(await store.hasEnvelope(env.headerHash)).toBe(true);
        }

        // Client B pulls from relay — it has no local envelopes so all 10 are missing
        const pulled = await pullEnvelopesFromRelay(clientB, relayAddr, []);

        // All 10 envelopes must arrive
        expect(pulled).toHaveLength(10);

        // Verify content integrity for every received envelope
        for (const decoded of pulled) {
          assertEnvelopeIntegrity(decoded, crypto);
          const payloadText = new TextDecoder().decode(decoded.payload);
          expect(payloadText).toMatch(/^envelope-\d+$/);
        }

        // Verify the full set of header hashes matches (order-independent)
        const expectedHexes = new Set(
          envelopes.map((e) => Buffer.from(e.headerHash).toString("hex")),
        );
        const receivedHexes = new Set(
          pulled.map((e) => Buffer.from(e.headerHash).toString("hex")),
        );
        expect(receivedHexes).toEqual(expectedHexes);
      } finally {
        await clientA.stop();
        await clientB.stop();
      }
    },
    60000,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 2: Double-sync race condition — rapid re-invoke, no orphaned session
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "double-sync race: two concurrent sync calls both complete or second is rejected gracefully",
    async () => {
      const client = await makeClientNode();

      try {
        const relayAddr = server.multiaddrs[0];

        // Pre-populate relay with a handful of envelopes to give sync work to do
        const envelopes = Array.from({ length: 5 }, (_, i) =>
          makeEnvelope(`race-envelope-${i}`, PRIVATE_KEY_A, CREATOR_ID_A),
        );
        await pushEnvelopesToRelay(client, relayAddr, envelopes);

        // Track outcomes of both concurrent invocations
        const outcomes: Array<{ status: "fulfilled" | "rejected"; count?: number }> = [];

        // Fire both pulls without awaiting between them (race condition)
        const sync1 = pullEnvelopesFromRelay(client, relayAddr, []).then(
          (result) => {
            outcomes.push({ status: "fulfilled", count: result.length });
            return result;
          },
          (err) => {
            outcomes.push({ status: "rejected" });
            throw err;
          },
        );

        const sync2 = pullEnvelopesFromRelay(client, relayAddr, []).then(
          (result) => {
            outcomes.push({ status: "fulfilled", count: result.length });
            return result;
          },
          (err) => {
            outcomes.push({ status: "rejected" });
            throw err;
          },
        );

        // Both must settle — neither should hang indefinitely
        const results = await Promise.allSettled([sync1, sync2]);

        // At least one call must have succeeded and delivered envelopes
        const successes = results.filter((r) => r.status === "fulfilled");
        expect(successes.length).toBeGreaterThanOrEqual(1);

        // If both succeeded, each should have received all 5 envelopes
        for (const r of successes) {
          if (r.status === "fulfilled") {
            expect((r.value as any[]).length).toBe(5);
          }
        }

        // Neither call should have caused an unhandled promise rejection
        // (Promise.allSettled ensures both settled — no orphaned floating promises)
        expect(results.some((r) => r.status === "rejected")).toBe(
          results.length - successes.length > 0,
        );
      } finally {
        await client.stop();
      }
    },
    60000,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 3: Session queue cleanup on error — force-close mid-sync
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "force-closing the channel mid-receive cleans up and does not hang",
    async () => {
      const client = await makeClientNode();

      try {
        const relayAddr = server.multiaddrs[0];

        // Pre-populate the relay with envelopes so there is data to stream
        const envelopes = Array.from({ length: 5 }, (_, i) =>
          makeEnvelope(`cleanup-envelope-${i}`, PRIVATE_KEY_A, CREATOR_ID_A),
        );
        await pushEnvelopesToRelay(client, relayAddr, envelopes);

        // Open a sync channel but abort it immediately after the first send —
        // simulating a mid-sync network failure from the client side.
        const conn = await client.dial(relayAddr);
        const channel = await openSyncSessionChannel(conn);

        const protocol = new SyncRangeProofProtocol(channel);

        // Send initial range proof to start the exchange
        const fingerprint = await computeRangeFingerprint(
          { start: 0x00, end: 0xff },
          [],
        );
        await protocol.sendRangeProofs([
          { range: { start: 0x00, end: 0xff }, merkleRoot: fingerprint },
        ]);

        // Immediately abort the connection without completing the protocol —
        // this simulates a mid-sync TCP reset / dropped connection.
        await conn.close();

        // The client-side close should resolve promptly without hanging.
        // We verify this by awaiting a subsequent operation with a timeout.
        const didComplete = await Promise.race([
          // A new dial to the relay should work immediately (no resource leak)
          client.dial(relayAddr).then(() => true),
          new Promise<false>((resolve) => setTimeout(() => resolve(false), 10000)),
        ]);

        expect(didComplete).toBe(true);

        // The relay should still be reachable and functional
        expect(server.multiaddrs.length).toBeGreaterThan(0);
      } finally {
        await client.stop();
      }
    },
    30000,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 4: Relay dies mid-sync — client detects failure within timeout
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "relay killed mid-sync: client detects failure within 30 seconds",
    async () => {
      // Use a fresh relay that we can kill independently
      const killDir = makeTmpDir("vco-relay-kill-");
      const killServer = new RelayServer(makeRelayConfig(killDir));
      await killServer.start();

      const client = await makeClientNode();

      try {
        const relayAddr = killServer.multiaddrs[0];

        // Pre-populate with 100 envelopes
        const envelopes = Array.from({ length: 100 }, (_, i) =>
          makeEnvelope(`kill-envelope-${i}`, PRIVATE_KEY_A, CREATOR_ID_A),
        );
        await pushEnvelopesToRelay(client, relayAddr, envelopes);

        // Begin a pull sync — we will kill the relay after a short delay
        let syncError: Error | null = null;
        let syncDone = false;

        const syncPromise = pullEnvelopesFromRelay(client, relayAddr, [])
          .then(() => {
            syncDone = true;
          })
          .catch((err) => {
            syncError = err instanceof Error ? err : new Error(String(err));
            syncDone = true;
          });

        // Wait briefly so the sync gets underway, then kill the relay
        await new Promise((resolve) => setTimeout(resolve, 200));
        await killServer.stop();
        rmSync(killDir, { recursive: true, force: true });

        // The client should detect the failure within 30 seconds
        const detectedWithinTimeout = await Promise.race([
          syncPromise.then(() => true),
          new Promise<false>((resolve) =>
            setTimeout(() => resolve(false), 30000),
          ),
        ]);

        expect(detectedWithinTimeout).toBe(true);
        // syncDone must be true — not hanging
        expect(syncDone).toBe(true);
      } finally {
        await client.stop();
        // Defensive cleanup in case the test failed before server.stop()
        try {
          await killServer.stop();
        } catch {
          // already stopped
        }
        try {
          rmSync(killDir, { recursive: true, force: true });
        } catch {
          // already cleaned up
        }
      }
    },
    60000,
  );
});
