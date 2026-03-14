import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RelayServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createVcoLibp2pNode, openSyncSessionChannel } from "@vco/vco-transport";
import { NobleCryptoProvider, deriveEd25519Multikey } from "@vco/vco-crypto";
import { createEnvelope, encodeEnvelopeProto } from "@vco/vco-core";
import http from "node:http";

let tmpDir: string;
let server: RelayServer;

const crypto = new NobleCryptoProvider();
const PRIVATE_KEY = new Uint8Array(32).fill(0x42);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEnvelope(payloadText: string = "hello relay") {
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

function makeConfig(dir: string, httpPort?: number) {
  return loadConfig({
    configPath: undefined,
    env: {
      VCO_DATA_DIR: dir,
      VCO_LISTEN_ADDRS: "/ip4/127.0.0.1/udp/0/quic-v1",
      ...(httpPort !== undefined ? { VCO_HTTP_PORT: httpPort.toString(), VCO_HTTP_HOST: "127.0.0.1" } : {}),
    },
  });
}

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-e2e-"));
  server = new RelayServer(makeConfig(tmpDir));
  await server.start();
}, 30000);

afterEach(async () => {
  await server.stop();
  rmSync(tmpDir, { recursive: true });
}, 30000);

describe("Relay Server E2E", () => {
  it("stores a submitted envelope in the relay's LevelDB store", async () => {
    const clientNode = await createVcoLibp2pNode({
      addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1"] },
    });
    await clientNode.start();

    try {
      const serverAddr = server.multiaddrs[0];
      const conn = await clientNode.dial(serverAddr);
      const channel = await openSyncSessionChannel(conn);

      const envelope = makeEnvelope("store verification test");
      const encoded = encodeEnvelopeProto(envelope);
      await channel.send(encoded);

      // Close the channel so the relay's receive loop terminates cleanly
      await channel.close();

      // Give the relay time to process and persist
      await new Promise(resolve => setTimeout(resolve, 300));

      const store = server.storeForTest!;
      expect(await store.hasEnvelope(envelope.headerHash)).toBe(true);

      const retrieved = await store.get(envelope.headerHash);
      expect(retrieved).toBeDefined();
      expect(retrieved!.payload).toEqual(envelope.payload);
    } finally {
      await clientNode.stop();
    }
  }, 30000);

  it("deduplicates envelopes — submitting the same envelope twice stores it once", async () => {
    const clientNode = await createVcoLibp2pNode({
      addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1"] },
    });
    await clientNode.start();

    try {
      const serverAddr = server.multiaddrs[0];
      const envelope = makeEnvelope("dedup test");
      const encoded = encodeEnvelopeProto(envelope);

      // First submission
      const conn1 = await clientNode.dial(serverAddr);
      const ch1 = await openSyncSessionChannel(conn1);
      await ch1.send(encoded);
      await ch1.close();

      // Second submission (same envelope)
      const conn2 = await clientNode.dial(serverAddr);
      const ch2 = await openSyncSessionChannel(conn2);
      await ch2.send(encoded);
      await ch2.close();

      await new Promise(resolve => setTimeout(resolve, 300));

      const store = server.storeForTest!;
      // Collect all hashes — should only have one entry for this envelope
      const hashes: Uint8Array[] = [];
      for await (const h of store.allHeaderHashes()) hashes.push(h);
      const matchingHashes = hashes.filter(h =>
        h.length === envelope.headerHash.length &&
        h.every((b, i) => b === envelope.headerHash[i])
      );
      expect(matchingHashes).toHaveLength(1);
    } finally {
      await clientNode.stop();
    }
  }, 30000);

  it("responds to health check", async () => {
    const testHttpPort = 14568;
    const tmpDir2 = mkdtempSync(join(tmpdir(), "vco-relay-health-"));
    const healthServer = new RelayServer(makeConfig(tmpDir2, testHttpPort));
    await healthServer.start();

    try {
      const res = await new Promise<string>((resolve, reject) => {
        http.get(`http://127.0.0.1:${testHttpPort}/health`, (res) => {
          let data = "";
          res.on("data", (chunk) => data += chunk);
          res.on("end", () => resolve(data));
        }).on("error", reject);
      });
      expect(res).toBe("OK");
    } finally {
      await healthServer.stop();
      rmSync(tmpDir2, { recursive: true });
    }
  }, 30000);
});
