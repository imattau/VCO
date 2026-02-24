# VCO Bootstrap Relay Design (v1)

Date: 2026-02-24
Branch: `vco-relay`

## Decisions

| Question | Decision |
|---|---|
| Deployment form | Runnable Node.js server (not a library) |
| Storage | LevelDB (`classic-level`) |
| Peer routing | Kad-DHT (`@libp2p/kad-dht`) + libp2p Identify |
| ZKP_AUTH default | Reject — operators must register verifiers explicitly |
| Configuration | JSON config file + env var overrides |

## Architecture

Single package `packages/vco-relay/`, composing `@vco/vco-core`, `@vco/vco-sync`, `@vco/vco-transport`.

```
packages/vco-relay/
├── src/
│   ├── config.ts         # JSON + env var config loading
│   ├── store.ts          # IRelayStore interface + LevelDBRelayStore
│   ├── admission.ts      # Envelope admission: PoW + VCOCore validation
│   ├── sync-handler.ts   # Per-session sync via SyncExchangeOrchestrator
│   ├── server.ts         # RelayServer class: libp2p, DHT, Identify, session loop
│   ├── main.ts           # Entry point
│   └── index.ts          # Public exports
└── test/
    ├── store.test.ts
    ├── admission.test.ts
    └── server.integration.test.ts
```

**Inbound connection flow:**
1. libp2p accepts QUIC → Noise handshake → Yamux stream
2. `sync-handler.ts` reads via `SyncRangeProofProtocol`
3. If PoW required → send `PowChallenge` frame
4. Range proof exchange (BISECT/COMPARE phases)
5. EXCHANGE: client sends encoded envelopes → `admitInboundEnvelope` → LevelDB
6. Relay sends requested envelopes to client

## Storage

**`IRelayStore` interface:**
```ts
interface IRelayStore {
  put(envelope: VcoEnvelope): Promise<void>;
  get(headerHash: Uint8Array): Promise<VcoEnvelope | undefined>;
  has(headerHash: Uint8Array): Promise<boolean>;
  allHeaderHashes(): AsyncIterable<Uint8Array>;
  powScore(headerHash: Uint8Array): Promise<number>;
  evict(headerHash: Uint8Array): Promise<void>;
  close(): Promise<void>;
}
```

**LevelDB key layout:**
- `env:<header_hash_hex>` → protobuf-encoded `Envelope`
- `idx:<pow_score_padded_3digits>:<header_hash_hex>` → empty (PoW-sorted eviction index)

Lowest PoW score envelopes evicted first when `maxStoreSizeMb` is exceeded.

## Admission

`RelayAdmissionOptions`:
- `core: VCOCore` — empty verifier registry by default; `ZKP_AUTH` envelopes rejected unless operators call `core.registerVerifier(circuitId, verifier)`
- `powPolicy: PowChallengePolicy` — `minDifficultyProvider` scales with connection count/queue depth
- `maxPayloadSize` — defaults to `MAX_VCO_SIZE`

`DEFAULT_POW_WINDOW` = 3600s. Challenge sent at session open when difficulty > 0.

## Server & Config

**`RelayServer`:**
```ts
class RelayServer {
  constructor(config: RelayConfig);
  async start(): Promise<void>;
  async stop(): Promise<void>;
  get peerId(): PeerId;
  get multiaddrs(): Multiaddr[];
}
```

libp2p: QUIC + `Noise_XX_25519_ChaChaPoly_SHA256` + Yamux + Identify + Kad-DHT (server mode). Connection limit via `connectionManager.maxConnections`.

**Config file (JSON):**
```jsonc
{
  "listenAddrs": ["/ip4/0.0.0.0/udp/4001/quic-v1"],
  "dataDir": "./relay-data",
  "maxConnections": 256,
  "pow": { "defaultDifficulty": 0, "maxDifficulty": 20, "windowSeconds": 3600 },
  "maxStoreSizeMb": 0
}
```

**Env var overrides:** `VCO_CONFIG`, `VCO_LISTEN_ADDRS`, `VCO_DATA_DIR`, `VCO_MAX_CONNECTIONS`, `VCO_POW_DEFAULT_DIFFICULTY`, `VCO_POW_MAX_DIFFICULTY`, `VCO_MAX_STORE_SIZE_MB`.

`main.ts`: loads config (file from `VCO_CONFIG` / `--config`), merges env vars, constructs `RelayServer`, calls `start()`, handles `SIGINT`/`SIGTERM` → `stop()`.

## Testing

- **`store.test.ts`** — put/get/has/evict, PoW-ordered eviction, store size limits. Temp dir per test.
- **`admission.test.ts`** — valid admit, tamper rejection, PoW threshold, ZKP_AUTH default reject, oversized payload.
- **`server.integration.test.ts`** — real libp2p client connects to ephemeral relay, full sync exchange, envelope storage and retrieval, PoW challenge round-trip. Real crypto throughout.
