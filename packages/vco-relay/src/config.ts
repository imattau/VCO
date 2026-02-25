import { readFileSync } from "node:fs";

export interface RelayPowConfig {
  defaultDifficulty: number;
  maxDifficulty: number;
  windowSeconds: number;
}

export interface RelayConfig {
  listenAddrs: string[];
  httpHost: string;
  httpPort?: number;
  dataDir: string;
  maxConnections: number;
  pow: RelayPowConfig;
  maxStoreSizeMb: number;
}

const DEFAULTS: RelayConfig = {
  listenAddrs: ["/ip4/0.0.0.0/udp/4001/quic-v1"],
  httpHost: "127.0.0.1",
  httpPort: 4000,
  dataDir: "./relay-data",
  maxConnections: 256,
  pow: { defaultDifficulty: 0, maxDifficulty: 20, windowSeconds: 3600 },
  maxStoreSizeMb: 0,
};

function assertPositiveInt(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer, got ${value}`);
  }
}

function parseEnvOverrides(env: Record<string, string | undefined>, config: RelayConfig): RelayConfig {
  const out = structuredClone(config);
  if (env.VCO_LISTEN_ADDRS) out.listenAddrs = env.VCO_LISTEN_ADDRS.split(",").map((s) => s.trim());
  if (env.VCO_HTTP_HOST) out.httpHost = env.VCO_HTTP_HOST;
  if (env.VCO_HTTP_PORT) out.httpPort = Number(env.VCO_HTTP_PORT);
  if (env.VCO_DATA_DIR) out.dataDir = env.VCO_DATA_DIR;
  if (env.VCO_MAX_CONNECTIONS) {
    const v = Number(env.VCO_MAX_CONNECTIONS);
    assertPositiveInt(v, "VCO_MAX_CONNECTIONS");
    out.maxConnections = v;
  }
  if (env.VCO_POW_DEFAULT_DIFFICULTY) {
    out.pow.defaultDifficulty = Number(env.VCO_POW_DEFAULT_DIFFICULTY);
  }
  if (env.VCO_POW_MAX_DIFFICULTY) {
    out.pow.maxDifficulty = Number(env.VCO_POW_MAX_DIFFICULTY);
  }
  if (env.VCO_MAX_STORE_SIZE_MB) {
    out.maxStoreSizeMb = Number(env.VCO_MAX_STORE_SIZE_MB);
  }
  return out;
}

export interface LoadConfigOptions {
  configPath: string | undefined;
  env: Record<string, string | undefined>;
}

export function loadConfig(options: LoadConfigOptions): RelayConfig {
  let config: RelayConfig = structuredClone(DEFAULTS);
  if (options.configPath) {
    const raw = JSON.parse(readFileSync(options.configPath, "utf8")) as Partial<RelayConfig>;
    config = { ...config, ...raw, pow: { ...config.pow, ...(raw.pow ?? {}) } };
  }
  config = parseEnvOverrides(options.env, config);
  assertPositiveInt(config.maxConnections, "maxConnections");
  return config;
}
