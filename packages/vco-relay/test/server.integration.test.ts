import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RelayServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

let tmpDir: string;
let server: RelayServer;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-server-"));
  const config = loadConfig({
    configPath: undefined,
    env: {
      VCO_DATA_DIR: tmpDir,
      VCO_LISTEN_ADDRS: "/ip4/127.0.0.1/udp/0/quic-v1",
    },
  });
  server = new RelayServer(config);
  await server.start();
}, 15000);

afterEach(async () => {
  await server.stop();
  rmSync(tmpDir, { recursive: true });
}, 15000);

describe("RelayServer", () => {
  it("starts and exposes a multiaddr", () => {
    const addrs = server.multiaddrs;
    expect(addrs.length).toBeGreaterThan(0);
    expect(server.peerId).toBeDefined();
  });
});
