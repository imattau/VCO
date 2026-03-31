/**
 * idle-timeout.test.ts
 *
 * Tests for idle session eviction, activity-based timer reset, and memory
 * growth bounds over many short-lived sessions.
 *
 * NOTE: The current RelayConfig / RelayServer implementation does not expose an
 * application-level idle timeout setting. Scenarios 1 and 2 therefore drive
 * idle behaviour through libp2p's connection-manager `inboundConnectionIdleTimeout`
 * option, which is injected by constructing the relay node directly (mirroring
 * the internals of RelayServer.start()) with a short timeout value. This is the
 * lowest-friction way to exercise the observable contract without modifying
 * production code in this PR.
 *
 * If a dedicated `idleTimeoutMs` field is added to RelayConfig in the future,
 * these tests should be migrated to use it via loadConfig / env vars.
 *
 * Scenarios:
 *  1. Idle session eviction — relay closes an inactive connection after timeout
 *  2. Active session not evicted — activity resets the idle timer
 *  3. Memory growth over 200 short sessions stays under 50 MB
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createVcoLibp2pNode, openSyncSessionChannel, handleSyncSessionChannels } from "@vco/vco-transport";
import { tcp } from "@libp2p/tcp";
import { quic } from "@chainsafe/libp2p-quic";
import { identify } from "@libp2p/identify";
import { generateKeyPair } from "@libp2p/crypto/keys";
import { NobleCryptoProvider, deriveEd25519Multikey } from "@vco/vco-crypto";
import { VCOCore, createEnvelope, encodeEnvelopeProto } from "@vco/vco-core";
import { LevelDBRelayStore } from "../src/store.js";
import { handleSyncSession } from "../src/sync-handler.js";
import type { Libp2pNode } from "@vco/vco-transport";
import type { IRelayStore } from "../src/store.js";

// ---------------------------------------------------------------------------
// Crypto fixtures
// ---------------------------------------------------------------------------

const crypto = new NobleCryptoProvider();
const PRIVATE_KEY = new Uint8Array(32).fill(0x77);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEnvelope(payloadText: string) {
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

// ---------------------------------------------------------------------------
// Minimal relay node factory
//
// Constructs a libp2p node + LevelDB store that mirrors what RelayServer does
// internally, but accepts an explicit `idleTimeoutMs` for the connection
// manager so tests can exercise eviction without waiting 300 s.
// ---------------------------------------------------------------------------

interface MinimalRelay {
  node: Libp2pNode;
  store: IRelayStore;
  dataDir: string;
  stop(): Promise<void>;
}

const MINIMAL_RELAY_CONFIG = {
  pow: { defaultDifficulty: 0, maxDifficulty: 20, windowSeconds: 3600 },
  maxConnections: 256,
  maxStoreSizeMb: 0,
};

async function startMinimalRelay(idleTimeoutMs: number): Promise<MinimalRelay> {
  const dataDir = mkdtempSync(join(tmpdir(), "vco-relay-idle-"));
  const store = new LevelDBRelayStore(dataDir);
  await store.open();

  const privateKey = await generateKeyPair("Ed25519");
  const core = new VCOCore(new NobleCryptoProvider());

  const node = await createVcoLibp2pNode({
    privateKey,
    addresses: { listen: ["/ip4/127.0.0.1/tcp/0"] },
    transports: [tcp()],
    services: {
      identify: identify({ agentVersion: "/vco/1.0.0" }),
    },
    connectionManager: {
      maxConnections: 256,
      maxIncomingPendingConnections: 1000,
      inboundConnectionThreshold: 256,
      // Short idle timeout so tests don't have to wait long
      inboundConnectionIdleTimeout: idleTimeoutMs,
    },
  });

  await handleSyncSessionChannels(node, async (channel) => {
    await handleSyncSession(channel, {
      store,
      core,
      config: MINIMAL_RELAY_CONFIG as any,
    });
  });

  await node.start();

  return {
    node,
    store,
    dataDir,
    async stop() {
      await node.stop();
      await store.close();
      rmSync(dataDir, { recursive: true, force: true });
    },
  };
}

async function makeClientNode(): Promise<Libp2pNode> {
  const node = await createVcoLibp2pNode({
    addresses: { listen: ["/ip4/127.0.0.1/tcp/0"] },
    transports: [tcp()],
  });
  await node.start();
  return node;
}

// ---------------------------------------------------------------------------
// Per-test state for the default relay (scenarios that need a fresh relay)
// ---------------------------------------------------------------------------

let relay: MinimalRelay;

beforeEach(async () => {
  // Default: 2 s idle timeout, overridden per-test where needed
  relay = await startMinimalRelay(2_000);
}, 30_000);

afterEach(async () => {
  await relay.stop();
}, 30_000);

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("idle timeout", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 1: Idle session eviction
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "relay closes an idle connection after the idle timeout",
    async () => {
      const IDLE_TIMEOUT_MS = 2_000;
      // Use a fresh relay with the short timeout for this test
      const idleRelay = await startMinimalRelay(IDLE_TIMEOUT_MS);
      const client = await makeClientNode();

      try {
        const relayAddr = idleRelay.node.getMultiaddrs()[0];
        const conn = await client.dial(relayAddr);

        // Open a sync channel but send nothing — hold the connection idle
        await openSyncSessionChannel(conn);

        // Wait longer than the idle timeout
        const waitMs = IDLE_TIMEOUT_MS + 1_500;
        await new Promise((resolve) => setTimeout(resolve, waitMs));

        // The relay should have closed the connection from its side.
        // We detect this by checking that the connection is no longer open:
        // `conn.status` transitions to "closed" when the remote resets.
        const connClosed = conn.status === "closed";

        // Alternatively confirm via libp2p's connection list on the client
        const openConns = client.getConnections(idleRelay.node.peerId!);
        const allEvicted = openConns.length === 0 || openConns.every(c => c.status === "closed");

        expect(connClosed || allEvicted).toBe(true);

        // Relay must still be healthy and accept new connections afterward
        const newConn = await client.dial(relayAddr);
        expect(newConn.status).toBe("open");
        await newConn.close();
      } finally {
        await client.stop();
        await idleRelay.stop();
      }
    },
    { timeout: 30_000 },
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 2: Active session not evicted during sync
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "connection with ongoing activity is not evicted before sync completes",
    async () => {
      const IDLE_TIMEOUT_MS = 2_000;
      const activeRelay = await startMinimalRelay(IDLE_TIMEOUT_MS);
      const client = await makeClientNode();

      try {
        const relayAddr = activeRelay.node.getMultiaddrs()[0];

        // Build 10 envelopes to push, sending one every 800 ms so the total
        // transfer takes ~8 s — well over the 2 s idle timeout.  Each send
        // constitutes activity that must reset the timer.
        const ENVELOPE_COUNT = 10;
        const SEND_INTERVAL_MS = 800; // 10 × 800 ms = 8 s > 2 s idle timeout

        const conn = await client.dial(relayAddr);
        const channel = await openSyncSessionChannel(conn);

        let sendError: Error | null = null;
        let sentCount = 0;

        for (let i = 0; i < ENVELOPE_COUNT; i++) {
          // Check that the connection is still live before each send
          if (conn.status === "closed") {
            sendError = new Error(`Connection closed prematurely after ${i} envelopes`);
            break;
          }

          const env = makeEnvelope(`active-session-env-${i}`);
          try {
            await channel.send(encodeEnvelopeProto(env));
            sentCount++;
          } catch (err) {
            sendError = err instanceof Error ? err : new Error(String(err));
            break;
          }

          // Throttle: pause between sends to simulate a slow sync.
          // The idle timer should be reset by each send, so the connection
          // must remain open for the full 8 s duration.
          if (i < ENVELOPE_COUNT - 1) {
            await new Promise((resolve) => setTimeout(resolve, SEND_INTERVAL_MS));
          }
        }

        // Close the channel gracefully
        try {
          await channel.close();
        } catch {
          // Ignore close errors — we care about the send sequence
        }

        // Give the relay a moment to persist the envelopes
        await new Promise((resolve) => setTimeout(resolve, 400));

        // No send should have failed due to eviction
        expect(sendError).toBeNull();
        expect(sentCount).toBe(ENVELOPE_COUNT);

        // All envelopes should be in the store
        let storedCount = 0;
        for await (const _ of activeRelay.store.allHeaderHashes()) storedCount++;
        expect(storedCount).toBe(ENVELOPE_COUNT);
      } finally {
        await client.stop();
        await activeRelay.stop();
      }
    },
    { timeout: 30_000 },
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 3: Memory growth over 200 short sessions
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "heap growth stays under 50 MB after 200 sequential connect-send-disconnect sessions",
    async () => {
      const SESSION_COUNT = 200;

      // Snapshot heap before the session flood
      if (global.gc) global.gc();
      const heapBefore = process.memoryUsage().heapUsed;

      const client = await makeClientNode();

      try {
        const relayAddr = relay.node.getMultiaddrs()[0];

        const envelopes: ReturnType<typeof makeEnvelope>[] = [];

        for (let i = 0; i < SESSION_COUNT; i++) {
          const env = makeEnvelope(`mem-test-session-${i}`);
          envelopes.push(env);

          const conn = await client.dial(relayAddr);
          const channel = await openSyncSessionChannel(conn);
          await channel.send(encodeEnvelopeProto(env));
          await channel.close();
          // Brief pause to let the relay persist and release the connection
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        // Allow the relay time to process the last batch
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Force GC if available (Node --expose-gc) before measuring
        if (global.gc) global.gc();
        const heapAfter = process.memoryUsage().heapUsed;

        const heapGrowthMb = (heapAfter - heapBefore) / (1024 * 1024);
        expect(heapGrowthMb).toBeLessThan(50);

        // Every envelope must be persisted
        let storedCount = 0;
        for await (const _ of relay.store.allHeaderHashes()) storedCount++;
        expect(storedCount).toBe(SESSION_COUNT);
      } finally {
        await client.stop();
      }
    },
    { timeout: 30_000 },
  );
});
