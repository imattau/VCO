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

async function makeEnvelope(payloadText: string): Promise<VcoEnvelope> {
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
let envelopes: VcoEnvelope[]; // [A, B, C, D, E]
let client2Store: Map<string, VcoEnvelope>;

/**
 * Client-side delta sync: sends range proofs, bisects until convergence,
 * then reads back missing envelopes until a zero-length sentinel arrives.
 * Returns the list of received envelopes and populates `targetStore`.
 */
async function runClientDeltaSync(
  serverAddr: any,
  node: Awaited<ReturnType<typeof createVcoLibp2pNode>>,
  localStore: Map<string, VcoEnvelope>,
): Promise<{ received: VcoEnvelope[]; channel: Awaited<ReturnType<typeof openSyncSessionChannel>> }> {
  const conn = await node.dial(serverAddr);
  const channel = await openSyncSessionChannel(conn);
  const protocol = new SyncRangeProofProtocol(channel);

  const localHashes = [...localStore.values()].map((e) => e.headerHash);
  const fullRange = { start: 0x00, end: 0xff };
  const initialRoot = await computeRangeFingerprint(fullRange, localHashes);
  const initialProofs: RangeProof[] = [{ range: fullRange, merkleRoot: initialRoot }];

  // Send initial range proofs
  await protocol.sendRangeProofs(initialProofs);

  // Bisect loop until convergence
  let relayProofs = await protocol.receiveRangeProofs();
  while (true) {
    const nextRound: RangeProof[] = [];
    let anyDiff = false;

    for (const rp of relayProofs) {
      const clientRoot = await computeRangeFingerprint(rp.range, localHashes);
      const match = clientRoot.length === rp.merkleRoot.length &&
        clientRoot.every((b, i) => b === rp.merkleRoot[i]);
      if (!match) {
        anyDiff = true;
        if (rp.range.start === rp.range.end) {
          // Unit range — stop bisecting this branch; relay will send the envelope
        } else {
          const mid = Math.floor((rp.range.start + rp.range.end) / 2);
          const leftRoot = await computeRangeFingerprint(
            { start: rp.range.start, end: mid },
            localHashes,
          );
          const rightRoot = await computeRangeFingerprint(
            { start: mid + 1, end: rp.range.end },
            localHashes,
          );
          nextRound.push(
            { range: { start: rp.range.start, end: mid }, merkleRoot: leftRoot },
            { range: { start: mid + 1, end: rp.range.end }, merkleRoot: rightRoot },
          );
        }
      }
    }

    if (!anyDiff || nextRound.length === 0) break;

    await protocol.sendRangeProofs(nextRound);
    relayProofs = await protocol.receiveRangeProofs();
  }

  // Read missing envelopes until zero-length sentinel
  const received: VcoEnvelope[] = [];
  while (true) {
    let bytes: Uint8Array;
    try {
      bytes = await channel.receive();
    } catch {
      break; // stream closed unexpectedly
    }
    if (bytes.length === 0) break; // pull phase complete sentinel
    try {
      const env = decodeEnvelopeProto(bytes);
      received.push(env);
      localStore.set(toHex(env.headerHash), env);
    } catch {
      // Not an envelope — ignore
    }
  }

  return { received, channel };
}

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

  // client1 pushes all 5 envelopes to relay via legacy push protocol
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
    const serverAddr = server.multiaddrs[0];
    const { received, channel } = await runClientDeltaSync(
      serverAddr,
      clientNode2,
      client2Store,
    );

    expect(received).toHaveLength(2);
    const receivedHexes = new Set(received.map((e) => toHex(e.headerHash)));
    expect(receivedHexes.has(toHex(envelopes[3].headerHash))).toBe(true); // D
    expect(receivedHexes.has(toHex(envelopes[4].headerHash))).toBe(true); // E

    await channel.close();
  }, 30000);

  it("relay deduplication — store still has exactly 5 envelopes after client2 push phase", async () => {
    const serverAddr = server.multiaddrs[0];
    const { channel } = await runClientDeltaSync(serverAddr, clientNode2, client2Store);

    // Push phase: client2 sends its original 3 envelopes (relay already has them)
    for (const env of envelopes.slice(0, 3)) {
      await channel.send(encodeEnvelopeProto(env));
    }
    await channel.close();

    // Wait for relay to process push
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = server.storeForTest!;
    const hashes: Uint8Array[] = [];
    for await (const h of store.allHeaderHashes()) hashes.push(h);
    expect(hashes).toHaveLength(5);
  }, 30000);

  it("client2 ends up with all 5 envelopes after delta sync", async () => {
    const serverAddr = server.multiaddrs[0];
    const { channel } = await runClientDeltaSync(serverAddr, clientNode2, client2Store);
    await channel.close();

    // client2Store was populated in-place by runClientDeltaSync
    expect(client2Store.size).toBe(5);
    for (const env of envelopes) {
      expect(client2Store.has(toHex(env.headerHash))).toBe(true);
    }
  }, 30000);
});
