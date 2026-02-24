import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, type RelayConfig } from "../src/config.js";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

let tmpDir: string;
beforeEach(() => { tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-config-")); });
afterEach(() => { rmSync(tmpDir, { recursive: true }); });

describe("loadConfig", () => {
  it("returns defaults when no file or env vars", () => {
    const config = loadConfig({ configPath: undefined, env: {} });
    expect(config.listenAddrs).toEqual(["/ip4/0.0.0.0/udp/4001/quic-v1"]);
    expect(config.maxConnections).toBe(256);
    expect(config.pow.defaultDifficulty).toBe(0);
    expect(config.pow.maxDifficulty).toBe(20);
    expect(config.pow.windowSeconds).toBe(3600);
    expect(config.maxStoreSizeMb).toBe(0);
  });

  it("loads from JSON file", () => {
    const cfgPath = join(tmpDir, "relay.json");
    writeFileSync(cfgPath, JSON.stringify({ maxConnections: 64 }));
    const config = loadConfig({ configPath: cfgPath, env: {} });
    expect(config.maxConnections).toBe(64);
  });

  it("env vars override file values", () => {
    const cfgPath = join(tmpDir, "relay.json");
    writeFileSync(cfgPath, JSON.stringify({ maxConnections: 64 }));
    const config = loadConfig({
      configPath: cfgPath,
      env: { VCO_MAX_CONNECTIONS: "128" },
    });
    expect(config.maxConnections).toBe(128);
  });

  it("throws on invalid maxConnections", () => {
    expect(() => loadConfig({ configPath: undefined, env: { VCO_MAX_CONNECTIONS: "abc" } }))
      .toThrow();
  });
});
