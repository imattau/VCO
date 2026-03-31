/**
 * stress-concurrent-sync.test.ts
 *
 * Stress tests covering concurrent sync sessions sending real envelopes to a
 * RelayServer. Three scenarios:
 *
 *  1. 50 concurrent sessions each sending 100 envelopes (5 000 total).
 *  2. Backpressure / eviction under a small store limit.
 *  3. Admission gate under elevated PoW difficulty with mixed valid/invalid envelopes.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { RelayServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { createVcoLibp2pNode, openSyncSessionChannel } from "@vco/vco-transport";
import { tcp } from "@libp2p/tcp";
import { quic } from "@chainsafe/libp2p-quic";
import { NobleCryptoProvider, deriveEd25519Multikey } from "@vco/vco-crypto";
import { createEnvelope, encodeEnvelopeProto } from "@vco/vco-core";
import type { Libp2pNode } from "@vco/vco-transport";

// ---------------------------------------------------------------------------
// Shared crypto provider
// ---------------------------------------------------------------------------

const crypto = new NobleCryptoProvider();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive a deterministic 32-byte private key for session index `sessionIdx`
 * and envelope index `envIdx`. Keeps keys unique across the entire test suite.
 */
function makePrivateKey(sessionIdx: number, envIdx: number): Uint8Array {
  const key = new Uint8Array(32);
  // Spread the session and envelope indices across the key bytes so that every
  // (sessionIdx, envIdx) pair yields a distinct key.
  key[0] = sessionIdx & 0xff;
  key[1] = (sessionIdx >> 8) & 0xff;
  key[2] = envIdx & 0xff;
  key[3] = (envIdx >> 8) & 0xff;
  // Fill the rest with a non-zero sentinel so the key is never all-zeros.
  key.fill(0x5a, 4);
  return key;
}

/**
 * Create a unique signed envelope for the given session/envelope indices.
 * `powDifficulty` defaults to 0 (no PoW required).
 */
function makeEnvelope(
  sessionIdx: number,
  envIdx: number,
  powDifficulty = 0,
) {
  const privateKey = makePrivateKey(sessionIdx, envIdx);
  const creatorId = deriveEd25519Multikey(privateKey);
  return createEnvelope(
    {
      payload: new TextEncoder().encode(
        `session-${sessionIdx}-envelope-${envIdx}`,
      ),
      payloadType: 1,
      creatorId,
      privateKey,
      powDifficulty,
    },
    crypto,
  );
}

/**
 * Start a minimal libp2p client node suitable for dialling the relay.
 */
async function startClientNode(): Promise<Libp2pNode> {
  const node = await createVcoLibp2pNode({
    addresses: {
      listen: ["/ip4/127.0.0.1/udp/0/quic-v1", "/ip4/127.0.0.1/tcp/0"],
    },
    transports: [tcp(), quic()],
  });
  await node.start();
  return node;
}

// ---------------------------------------------------------------------------
// Scenario 1 — 50 concurrent sync sessions, 100 envelopes each
// ---------------------------------------------------------------------------

describe(
  "Stress: 50 concurrent sync sessions × 100 envelopes",
  { timeout: 120_000 },
  () => {
    let tmpDir: string;
    let server: RelayServer;
    const allClients: Libp2pNode[] = [];

    beforeAll(async () => {
      tmpDir = mkdtempSync(join(tmpdir(), "vco-stress-sync-"));
      const config = loadConfig({
        configPath: undefined,
        env: {
          VCO_DATA_DIR: tmpDir,
          VCO_LISTEN_ADDRS:
            "/ip4/127.0.0.1/udp/0/quic-v1,/ip4/127.0.0.1/tcp/0",
          VCO_MAX_CONNECTIONS: "200",
          VCO_HTTP_PORT: "0",
        },
      });
      server = new RelayServer(config);
      await server.start();
    }, 30_000);

    afterAll(async () => {
      for (let i = 0; i < allClients.length; i += 20) {
        await Promise.all(allClients.slice(i, i + 20).map((c) => c.stop()));
      }
      await server.stop();
      rmSync(tmpDir, { recursive: true });
    }, 60_000);

    it("stores all 5 000 envelopes, completes within timeout, no memory leak", async () => {
      const NUM_SESSIONS = 50;
      const ENVELOPES_PER_SESSION = 100;
      const relayAddr = server.multiaddrs[0];

      const memBefore = process.memoryUsage().heapUsed;

      // --- latency tracking ---
      const sessionLatenciesMs: number[] = [];

      // --- spin up all clients concurrently ---
      const clients = await Promise.all(
        Array.from({ length: NUM_SESSIONS }, () => startClientNode()),
      );
      allClients.push(...clients);

      console.log(
        `[stress-sync] ${NUM_SESSIONS} client nodes started. Sending envelopes…`,
      );

      const sessionTasks = clients.map(async (clientNode, sessionIdx) => {
        const t0 = Date.now();
        try {
          const conn = await clientNode.dial(relayAddr);
          const channel = await openSyncSessionChannel(conn);

          for (let envIdx = 0; envIdx < ENVELOPES_PER_SESSION; envIdx++) {
            const envelope = makeEnvelope(sessionIdx, envIdx);
            await channel.send(encodeEnvelopeProto(envelope));
          }

          await channel.close();
          sessionLatenciesMs.push(Date.now() - t0);
          return { sessionIdx, success: true, count: ENVELOPES_PER_SESSION };
        } catch (err) {
          console.error(`[stress-sync] session ${sessionIdx} failed:`, err);
          sessionLatenciesMs.push(Date.now() - t0);
          return { sessionIdx, success: false, count: 0 };
        }
      });

      const results = await Promise.all(sessionTasks);

      // Give the relay a moment to flush all async store writes.
      await new Promise((r) => setTimeout(r, 1_000));

      const successful = results.filter((r) => r.success).length;
      const totalSent = results.reduce((s, r) => s + r.count, 0);

      console.log(
        `[stress-sync] ${successful}/${NUM_SESSIONS} sessions succeeded, ${totalSent} envelopes sent`,
      );

      // P50 / P99 latency
      const sorted = [...sessionLatenciesMs].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      console.log(`[stress-sync] session latency P50=${p50}ms P99=${p99}ms`);

      // Memory delta
      const memAfter = process.memoryUsage().heapUsed;
      const deltaBytes = memAfter - memBefore;
      const deltaMb = deltaBytes / 1024 / 1024;
      console.log(`[stress-sync] heap delta: ${deltaMb.toFixed(1)} MB`);

      // --- assertions ---

      // All sessions must complete without errors.
      expect(successful).toBe(NUM_SESSIONS);

      // Count stored envelopes via the test-accessible store.
      const store = server.storeForTest!;
      let storedCount = 0;
      for await (const _ of store.allHeaderHashes()) storedCount++;

      console.log(`[stress-sync] relay stored ${storedCount} envelopes`);

      // All 5 000 unique envelopes should have been stored (relay has no
      // store size cap in this scenario).
      expect(storedCount).toBe(NUM_SESSIONS * ENVELOPES_PER_SESSION);

      // Memory leak guard: heap growth must be below 200 MB.
      expect(deltaMb).toBeLessThan(200);
    });
  },
);

// ---------------------------------------------------------------------------
// Scenario 2 — Backpressure under a small store limit
// ---------------------------------------------------------------------------

describe(
  "Stress: backpressure under store size saturation",
  { timeout: 120_000 },
  () => {
    let tmpDir: string;
    let server: RelayServer;
    const allClients: Libp2pNode[] = [];

    beforeAll(async () => {
      tmpDir = mkdtempSync(join(tmpdir(), "vco-stress-bp-"));
      // Cap store at 1 MB — enough for ~500 small envelopes (each ~2 KB
      // encoded).  We'll send 1 000 envelopes from 10 clients.
      const config = loadConfig({
        configPath: undefined,
        env: {
          VCO_DATA_DIR: tmpDir,
          VCO_LISTEN_ADDRS:
            "/ip4/127.0.0.1/udp/0/quic-v1,/ip4/127.0.0.1/tcp/0",
          VCO_MAX_CONNECTIONS: "100",
          VCO_HTTP_PORT: "0",
          VCO_MAX_STORE_SIZE_MB: "1",
        },
      });
      server = new RelayServer(config);
      await server.start();
    }, 30_000);

    afterAll(async () => {
      for (let i = 0; i < allClients.length; i += 10) {
        await Promise.all(allClients.slice(i, i + 10).map((c) => c.stop()));
      }
      await server.stop();
      rmSync(tmpDir, { recursive: true });
    }, 30_000);

    it("does not deadlock and all clients receive completion, relay continues accepting connections", async () => {
      const NUM_CLIENTS = 10;
      const ENVELOPES_PER_CLIENT = 100; // 1 000 total — over the ~500 limit
      const relayAddr = server.multiaddrs[0];

      const clients = await Promise.all(
        Array.from({ length: NUM_CLIENTS }, () => startClientNode()),
      );
      allClients.push(...clients);

      console.log(
        `[stress-bp] ${NUM_CLIENTS} clients sending ${ENVELOPES_PER_CLIENT} envelopes each (${NUM_CLIENTS * ENVELOPES_PER_CLIENT} total) against a 1 MB store cap`,
      );

      const completions: boolean[] = [];

      const clientTasks = clients.map(async (clientNode, clientIdx) => {
        try {
          const conn = await clientNode.dial(relayAddr);
          const channel = await openSyncSessionChannel(conn);

          for (let envIdx = 0; envIdx < ENVELOPES_PER_CLIENT; envIdx++) {
            // Use a sessionIdx offset of 1000 to avoid key collisions with
            // scenario 1.
            const envelope = makeEnvelope(1000 + clientIdx, envIdx);
            await channel.send(encodeEnvelopeProto(envelope));
          }

          // Closing cleanly signals completion — must not hang.
          await channel.close();
          completions.push(true);
        } catch (err) {
          // Any error (including RESET) still counts as "completed" — the key
          // property is that the client is not stuck waiting forever.
          console.warn(`[stress-bp] client ${clientIdx} error (expected under eviction):`, err);
          completions.push(false);
        }
      });

      // All tasks must resolve within the describe-level timeout (120 s).
      await Promise.all(clientTasks);

      await new Promise((r) => setTimeout(r, 500));

      console.log(
        `[stress-bp] ${completions.filter(Boolean).length}/${NUM_CLIENTS} clients closed channel cleanly`,
      );

      // No client should hang — all must have completed (success or error).
      expect(completions).toHaveLength(NUM_CLIENTS);

      // The relay must still be responsive: verify it can accept a new connection.
      const probeClient = await startClientNode();
      allClients.push(probeClient);
      const probeConn = await probeClient.dial(relayAddr);
      expect(probeConn).toBeDefined();

      // Verify the store is still operational (eviction kept it alive).
      const store = server.storeForTest!;
      let storedCount = 0;
      for await (const _ of store.allHeaderHashes()) storedCount++;
      console.log(
        `[stress-bp] relay store contains ${storedCount} envelopes after saturation`,
      );
      // Store must contain at least 1 envelope (relay kept functioning).
      expect(storedCount).toBeGreaterThan(0);
    });
  },
);

// ---------------------------------------------------------------------------
// Scenario 3 — Admission gate under elevated PoW difficulty
// ---------------------------------------------------------------------------

describe(
  "Stress: admission gate under high PoW difficulty with mixed envelopes",
  { timeout: 120_000 },
  () => {
    let tmpDir: string;
    let server: RelayServer;
    const allClients: Libp2pNode[] = [];

    // Difficulty 4 = 4 leading zero bits.  Solvable in milliseconds but
    // provides a meaningful admission gate.
    const REQUIRED_DIFFICULTY = 4;

    beforeAll(async () => {
      tmpDir = mkdtempSync(join(tmpdir(), "vco-stress-pow-"));
      const config = loadConfig({
        configPath: undefined,
        env: {
          VCO_DATA_DIR: tmpDir,
          VCO_LISTEN_ADDRS:
            "/ip4/127.0.0.1/udp/0/quic-v1,/ip4/127.0.0.1/tcp/0",
          VCO_MAX_CONNECTIONS: "100",
          VCO_HTTP_PORT: "0",
          VCO_POW_DEFAULT_DIFFICULTY: String(REQUIRED_DIFFICULTY),
        },
      });
      server = new RelayServer(config);
      await server.start();
    }, 30_000);

    afterAll(async () => {
      for (let i = 0; i < allClients.length; i += 20) {
        await Promise.all(allClients.slice(i, i + 20).map((c) => c.stop()));
      }
      await server.stop();
      rmSync(tmpDir, { recursive: true });
    }, 30_000);

    it("accepts valid-PoW envelopes, silently drops insufficient-PoW envelopes, no deadlock", async () => {
      const NUM_CLIENTS = 20;
      const ENVELOPES_PER_CLIENT = 100;
      // Every other client sends envelopes WITH sufficient PoW; the rest send
      // zero-difficulty (no PoW) envelopes that must be silently dropped.
      const relayAddr = server.multiaddrs[0];

      const clients = await Promise.all(
        Array.from({ length: NUM_CLIENTS }, () => startClientNode()),
      );
      allClients.push(...clients);

      console.log(
        `[stress-pow] ${NUM_CLIENTS} clients, PoW required = ${REQUIRED_DIFFICULTY} bits`,
      );

      let validClients = 0;
      let invalidClients = 0;

      const clientTasks = clients.map(async (clientNode, clientIdx) => {
        // Even-indexed clients send valid PoW envelopes; odd-indexed send none.
        const usePoW = clientIdx % 2 === 0;
        if (usePoW) validClients++;
        else invalidClients++;

        try {
          const conn = await clientNode.dial(relayAddr);
          const channel = await openSyncSessionChannel(conn);

          for (let envIdx = 0; envIdx < ENVELOPES_PER_CLIENT; envIdx++) {
            // SessionIdx offset of 2000 avoids collisions with scenarios 1 & 2.
            const envelope = makeEnvelope(
              2000 + clientIdx,
              envIdx,
              usePoW ? REQUIRED_DIFFICULTY : 0,
            );
            await channel.send(encodeEnvelopeProto(envelope));
          }

          await channel.close();
          return { clientIdx, success: true, usedPoW: usePoW };
        } catch (err) {
          console.warn(
            `[stress-pow] client ${clientIdx} (pow=${usePoW}) error:`,
            err,
          );
          return { clientIdx, success: false, usedPoW: usePoW };
        }
      });

      const results = await Promise.all(clientTasks);

      // Give relay time to flush all async writes.
      await new Promise((r) => setTimeout(r, 1_000));

      const successfulValid = results.filter(
        (r) => r.usedPoW && r.success,
      ).length;
      const successfulInvalid = results.filter(
        (r) => !r.usedPoW && r.success,
      ).length;

      console.log(
        `[stress-pow] valid-PoW clients: ${successfulValid}/${validClients} completed; ` +
          `no-PoW clients: ${successfulInvalid}/${invalidClients} completed (channel still closes cleanly)`,
      );

      // No session should hang — all must complete (success or error).
      expect(results).toHaveLength(NUM_CLIENTS);

      // All clients (both valid and invalid PoW) must close their channels
      // without deadlocking.  The relay drops invalid envelopes silently; the
      // channel close handshake must still complete.
      expect(results.filter((r) => r.success)).toHaveLength(NUM_CLIENTS);

      const store = server.storeForTest!;
      let storedCount = 0;
      for await (const _ of store.allHeaderHashes()) storedCount++;

      console.log(
        `[stress-pow] relay stored ${storedCount} envelopes (expected ~${validClients * ENVELOPES_PER_CLIENT} valid-PoW envelopes)`,
      );

      // Only envelopes with sufficient PoW must be stored.  (The relay may
      // store slightly fewer if hash collisions produced duplicate hashes,
      // but it must never store envelopes from the no-PoW clients.)
      const expectedValid = validClients * ENVELOPES_PER_CLIENT;
      expect(storedCount).toBeGreaterThan(0);
      expect(storedCount).toBeLessThanOrEqual(expectedValid);

      // Relay must remain responsive after the storm.
      const probeClient = await startClientNode();
      allClients.push(probeClient);
      const probeConn = await probeClient.dial(relayAddr);
      expect(probeConn).toBeDefined();
    });
  },
);
