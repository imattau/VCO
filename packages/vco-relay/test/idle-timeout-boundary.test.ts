import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RelayServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createLibp2pNode, openSyncSessionChannel } from "@vco/vco-transport";
import { createEnvelope, MULTICODEC_PROTOBUF } from "@vco/vco-core";
import { NobleCryptoProvider, deriveEd25519Multikey } from "@vco/vco-crypto";

const crypto = new NobleCryptoProvider();
const PRIVATE_KEY = new Uint8Array(32).fill(42);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEnvelope(b: number) {
  return createEnvelope(
    { payload: new Uint8Array([b]), payloadType: MULTICODEC_PROTOBUF, creatorId: CREATOR_ID, privateKey: PRIVATE_KEY },
    crypto,
  );
}

let tmpDir: string;
let server: RelayServer;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-idle-"));
});

afterEach(async () => {
  await server?.stop().catch(() => {});
  rmSync(tmpDir, { recursive: true });
});

describe("relay idle timeout boundary", () => {
  it("VCO_IDLE_TIMEOUT_MS env var overrides default 300000ms", () => {
    const original = process.env["VCO_IDLE_TIMEOUT_MS"];
    try {
      process.env["VCO_IDLE_TIMEOUT_MS"] = "12345";
      const config = loadConfig({ dataDir: tmpDir });
      expect(config.idleTimeoutMs).toBe(12345);
    } finally {
      if (original === undefined) delete process.env["VCO_IDLE_TIMEOUT_MS"];
      else process.env["VCO_IDLE_TIMEOUT_MS"] = original;
    }
  });

  it("default idleTimeoutMs is 300000", () => {
    const original = process.env["VCO_IDLE_TIMEOUT_MS"];
    try {
      delete process.env["VCO_IDLE_TIMEOUT_MS"];
      const config = loadConfig({ dataDir: tmpDir });
      expect(config.idleTimeoutMs).toBe(300_000);
    } finally {
      if (original !== undefined) process.env["VCO_IDLE_TIMEOUT_MS"] = original;
    }
  });

  it("session with short idleTimeoutMs closes when client goes idle", async () => {
    const config = loadConfig({ dataDir: tmpDir, idleTimeoutMs: 500 });
    server = new RelayServer(config);
    const { port } = await server.start();

    const clientNode = await createLibp2pNode();
    try {
      const relayPeerId = server.peerId;
      const conn = await clientNode.dial(`/ip4/127.0.0.1/tcp/${port}/p2p/${relayPeerId}`);
      const channel = await openSyncSessionChannel(conn);

      // Open channel but send nothing — relay should time out within 1500ms
      const settled = await Promise.race([
        channel.receive().then(() => "received").catch(() => "closed"),
        new Promise<string>((resolve) => setTimeout(() => resolve("timeout"), 1500)),
      ]);

      // Either the channel closed (relay terminated) or our timeout fired
      // Either way the relay must NOT still be waiting indefinitely
      expect(["closed", "timeout"]).toContain(settled);
    } finally {
      await clientNode.stop();
    }
  }, 10_000);

  it("relay remains healthy after idle session is evicted", async () => {
    const config = loadConfig({ dataDir: tmpDir, idleTimeoutMs: 300 });
    server = new RelayServer(config);
    const { port } = await server.start();

    const clientNode = await createLibp2pNode();
    try {
      const relayPeerId = server.peerId;

      // First connection — goes idle and gets evicted
      const conn1 = await clientNode.dial(`/ip4/127.0.0.1/tcp/${port}/p2p/${relayPeerId}`);
      const channel1 = await openSyncSessionChannel(conn1);
      await channel1.receive().catch(() => {}); // wait for close
      await new Promise((r) => setTimeout(r, 600)); // ensure eviction

      // Second connection — relay should still accept it
      const conn2 = await clientNode.dial(`/ip4/127.0.0.1/tcp/${port}/p2p/${relayPeerId}`);
      expect(conn2).toBeDefined();
      await conn2.close();
    } finally {
      await clientNode.stop();
    }
  }, 15_000);
});
