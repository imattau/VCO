/**
 * session-timeout.test.ts
 *
 * Tests covering session-timeout and abrupt-disconnect behaviour:
 *
 *  1. Relay stops responding mid-sync — client detects within 30 s
 *     Start relay, push 100 envelopes, begin a pull, kill the relay after 20
 *     envelopes' worth of wall-clock time, verify the client-side promise
 *     settles (resolved or rejected) within 30 s.
 *
 *  2. Partial sync — relay closes socket before zero-length sentinel
 *     The relay streams some envelopes then drops the TCP connection without
 *     sending the zero-length sentinel.  Verify the client does not hang
 *     indefinitely and either resolves (partial) or rejects promptly.
 *
 *  3. Relay accepts then immediately closes
 *     The relay accepts the libp2p connection but closes it before any sync
 *     exchange.  Verify the client detects failure within 5 s.
 *
 * All tests use real TCP sockets, random port 0, NobleCryptoProvider.
 * Cleanup is performed in afterEach.
 */

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
} from "@vco/vco-core";
import { SyncRangeProofProtocol, computeRangeFingerprint } from "@vco/vco-sync";
import type { Libp2pNode } from "@vco/vco-transport";

// ---------------------------------------------------------------------------
// Shared crypto fixtures
// ---------------------------------------------------------------------------

const crypto = new NobleCryptoProvider();
const PRIVATE_KEY = new Uint8Array(32).fill(0x55);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEnvelope(tag: string) {
  return createEnvelope(
    {
      payload: new TextEncoder().encode(tag),
      payloadType: 1,
      creatorId: CREATOR_ID,
      privateKey: PRIVATE_KEY,
    },
    crypto,
  );
}

// ---------------------------------------------------------------------------
// Infrastructure helpers
// ---------------------------------------------------------------------------

function makeTmpDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function makeRelayConfig(dir: string) {
  return loadConfig({
    configPath: undefined,
    env: {
      VCO_DATA_DIR: dir,
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

/**
 * Push `envelopes` to the relay using the raw-envelope (legacy push) protocol,
 * then wait briefly for the relay to persist them.
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
  // Give the relay time to process and persist
  await new Promise((resolve) => setTimeout(resolve, 400));
}

/**
 * Open a sync channel to the relay and send the initial range-proof frame so
 * the range-proof exchange can begin.  Returns the open channel so the caller
 * can control what happens next.
 */
async function openPullChannel(clientNode: Libp2pNode, relayAddr: any) {
  const conn = await clientNode.dial(relayAddr);
  const channel = await openSyncSessionChannel(conn);
  const protocol = new SyncRangeProofProtocol(channel);

  const localFingerprint = await computeRangeFingerprint(
    { start: 0x00, end: 0xff },
    [], // client has nothing — relay will send everything
  );
  await protocol.sendRangeProofs([
    { range: { start: 0x00, end: 0xff }, merkleRoot: localFingerprint },
  ]);

  return { conn, channel, protocol };
}

/**
 * Complete a full pull from the relay after the range exchange round trip.
 * Reads until the zero-length sentinel or a receive error.
 */
async function drainEnvelopes(
  channel: ReturnType<typeof openSyncSessionChannel> extends Promise<infer T> ? T : never,
): Promise<ReturnType<typeof decodeEnvelopeProto>[]> {
  const received: ReturnType<typeof decodeEnvelopeProto>[] = [];
  while (true) {
    let bytes: Uint8Array;
    try {
      bytes = await channel.receive();
    } catch {
      break; // connection closed — treat as end-of-stream
    }
    if (bytes.length === 0) break; // zero-length sentinel
    received.push(decodeEnvelopeProto(bytes));
  }
  return received;
}

// ---------------------------------------------------------------------------
// Per-test state
// ---------------------------------------------------------------------------

let tmpDir: string;
let server: RelayServer;

beforeEach(async () => {
  tmpDir = makeTmpDir("vco-relay-timeout-");
  server = new RelayServer(makeRelayConfig(tmpDir));
  await server.start();
}, 30000);

afterEach(async () => {
  await server.stop();
  rmSync(tmpDir, { recursive: true, force: true });
}, 30000);

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("session timeout / abrupt disconnect", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 1: Relay stops responding mid-sync — client detects within 30 s
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "relay killed mid-sync (100 envelopes): client detects failure within 30 s",
    async () => {
      // Use a dedicated relay that we can kill independently of the main one.
      const killDir = makeTmpDir("vco-relay-kill-mid-");
      const killServer = new RelayServer(makeRelayConfig(killDir));
      await killServer.start();

      const client = await makeClientNode();

      try {
        const relayAddr = killServer.multiaddrs[0];

        // Pre-populate with 100 envelopes so the relay has data to stream.
        const envelopes = Array.from({ length: 100 }, (_, i) =>
          makeEnvelope(`timeout-envelope-${i}`),
        );
        await pushEnvelopesToRelay(client, relayAddr, envelopes);

        // Verify relay stored all 100.
        const store = killServer.storeForTest!;
        for (const env of envelopes) {
          expect(await store.hasEnvelope(env.headerHash)).toBe(true);
        }

        // Begin a pull — the client sends range proofs and then reads back
        // envelopes.  We kill the relay mid-stream after a short delay.
        let syncSettled = false;
        let syncResult: "resolved" | "rejected" | null = null;

        const syncPromise = (async () => {
          const { channel, protocol } = await openPullChannel(client, relayAddr);
          // Receive the relay's matching range proofs (one exchange round).
          await protocol.receiveRangeProofs();
          // Drain envelopes until sentinel or error.
          return drainEnvelopes(channel);
        })()
          .then((result) => {
            syncSettled = true;
            syncResult = "resolved";
            return result;
          })
          .catch((err) => {
            syncSettled = true;
            syncResult = "rejected";
            // Re-throw so Promise.race can observe the rejection.
            throw err;
          });

        // Let the pull get underway (relay should start streaming), then
        // abruptly stop the relay to simulate a mid-sync crash.
        await new Promise((resolve) => setTimeout(resolve, 150));
        await killServer.stop();
        rmSync(killDir, { recursive: true, force: true });

        // The client MUST detect the failure within 30 seconds.
        const detectedWithinTimeout = await Promise.race([
          Promise.allSettled([syncPromise]).then(() => true),
          new Promise<false>((resolve) => setTimeout(() => resolve(false), 30_000)),
        ]);

        expect(detectedWithinTimeout).toBe(true);
        expect(syncSettled).toBe(true);
        // The outcome is either resolved (partial data) or rejected (error) —
        // both are acceptable; a hang is not.
        expect(syncResult === "resolved" || syncResult === "rejected").toBe(true);
      } finally {
        await client.stop();
        // Defensive cleanup if the test failed before stop().
        try { await killServer.stop(); } catch { /* already stopped */ }
        try { rmSync(killDir, { recursive: true, force: true }); } catch { /* already removed */ }
      }
    },
    60_000,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 2: Partial sync — relay closes socket before zero-length sentinel
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "relay closes connection before sentinel: client does not hang indefinitely",
    async () => {
      // Use a separate relay that we kill mid-stream to simulate a truncated
      // TCP session (no zero-length sentinel ever arrives).
      const partialDir = makeTmpDir("vco-relay-partial-");
      const partialServer = new RelayServer(makeRelayConfig(partialDir));
      await partialServer.start();

      const client = await makeClientNode();

      try {
        const relayAddr = partialServer.multiaddrs[0];

        // Pre-populate with 20 envelopes.
        const envelopes = Array.from({ length: 20 }, (_, i) =>
          makeEnvelope(`partial-envelope-${i}`),
        );
        await pushEnvelopesToRelay(client, relayAddr, envelopes);

        // Open the pull channel and complete the range-proof exchange.
        const { channel, protocol } = await openPullChannel(client, relayAddr);
        await protocol.receiveRangeProofs();

        // Let the relay start streaming envelopes for a short while, then
        // abruptly close the relay without sending the sentinel.
        await new Promise((resolve) => setTimeout(resolve, 100));
        await partialServer.stop();
        rmSync(partialDir, { recursive: true, force: true });

        // The drainEnvelopes call must settle — not hang indefinitely.
        // We accept either partial data (resolved) or an error (rejected).
        let settled = false;
        const drainPromise = drainEnvelopes(channel)
          .then(() => { settled = true; })
          .catch(() => { settled = true; });

        const completedWithinTimeout = await Promise.race([
          drainPromise.then(() => true),
          new Promise<false>((resolve) => setTimeout(() => resolve(false), 30_000)),
        ]);

        expect(completedWithinTimeout).toBe(true);
        expect(settled).toBe(true);
      } finally {
        await client.stop();
        try { await partialServer.stop(); } catch { /* already stopped */ }
        try { rmSync(partialDir, { recursive: true, force: true }); } catch { /* already removed */ }
      }
    },
    60_000,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scenario 3: Relay accepts connection then immediately closes
  // ──────────────────────────────────────────────────────────────────────────
  it(
    "relay accepts then immediately closes: client detects failure within 5 s",
    async () => {
      // Use a dedicated relay that we stop immediately after the client dials,
      // before any sync protocol frames are exchanged.
      const earlyDir = makeTmpDir("vco-relay-early-close-");
      const earlyServer = new RelayServer(makeRelayConfig(earlyDir));
      await earlyServer.start();

      const client = await makeClientNode();

      try {
        const relayAddr = earlyServer.multiaddrs[0];

        // Dial but do NOT send anything yet — we want the relay to close
        // the connection before the sync exchange starts.
        const dialPromise = client.dial(relayAddr);

        // Stop the relay almost immediately — before the client has a chance
        // to open the sync session channel and exchange any frames.
        // A tiny wait lets the TCP handshake complete so the relay genuinely
        // "accepts" the connection before closing it.
        await new Promise((resolve) => setTimeout(resolve, 50));
        await earlyServer.stop();
        rmSync(earlyDir, { recursive: true, force: true });

        // The entire dial + channel open + first receive must either fail or
        // complete within 5 seconds — no indefinite hang.
        let settled = false;
        const clientAttempt = (async () => {
          let conn;
          try {
            conn = await dialPromise;
          } catch {
            // Dial itself rejected — relay was gone, that's fine.
            return;
          }
          const channel = await openSyncSessionChannel(conn);
          // Attempt to receive any frame — should throw or return promptly
          // because the relay has already closed the connection.
          try {
            await channel.receive();
          } catch {
            // Expected: stream reset / connection closed.
          }
        })()
          .then(() => { settled = true; })
          .catch(() => { settled = true; });

        const completedWithinTimeout = await Promise.race([
          clientAttempt.then(() => true),
          new Promise<false>((resolve) => setTimeout(() => resolve(false), 5_000)),
        ]);

        expect(completedWithinTimeout).toBe(true);
        expect(settled).toBe(true);
      } finally {
        await client.stop();
        try { await earlyServer.stop(); } catch { /* already stopped */ }
        try { rmSync(earlyDir, { recursive: true, force: true }); } catch { /* already removed */ }
      }
    },
    30_000,
  );
});
