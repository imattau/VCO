![VCO Logo](../../VCO_Logo.png)

# @vco/vco-relay

A robust, standalone bootstrap relay and storage server for the Verifiable Content Object (VCO) protocol.

The VCO Relay serves as a backbone for decentralized discovery, providing stable endpoints for peer discovery, persistent object storage, and efficient content reconciliation across the network.

## Key Features

- **P2P Relay & Discovery**: Built on `libp2p`, serving as a bootstrap node for mDNS and Kademlia DHT discovery.
- **Blind Context Routing (ADR 0004)**: Supports efficient routing and filtered synchronization using 8-byte Blind Context IDs (BCID), allowing topic-based propagation without content inspection.
- **QoS Prioritization (ADR 0005)**: Implements priority-aware traffic management. High-priority traffic is processed and propagated before low-priority "noise."
- **Persistent Storage**: LevelDB-backed store for durable content retention and fast lookups.
- **Replay Protection**: Built-in persistent nullifier tracking for ZKP-authenticated envelopes, preventing double-submission even across relay restarts.
- **Priority-Aware Eviction**: Automatically targets the lowest-priority, lowest-work objects first when storage limits are reached, ensuring network Quality of Service.
- **Health & Monitoring**: Integrated HTTP API for health checks and operational status monitoring.

## Architecture

The relay integrates several core VCO modules:
- **@vco/vco-core**: Protocol logic, PoW verification, and ZKP dispatching.
- **@vco/vco-sync**: Range-based set reconciliation protocol implementation.
- **@vco/vco-transport**: Libp2p node management and Transport Obfuscation Layer (TOL) integration.

### Storage Model
Envelopes are indexed using a composite strategy that enables protocol-level Quality of Service:
- `env:${headerHash}`: The primary object store.
- `idx:${priority}:${powScore}:${headerHash}`: A combined priority and work index for O(1) identification of the worst-performing eviction candidates.
- `ctx:${contextId}:${headerHash}`: A blind context index supporting filtered synchronization and targeted routing.
- `nul:${nullifierHex}`: A persistent nullifier log ensuring uniqueness for anonymous (ZKP) traffic.

## Configuration

The relay can be configured via environment variables or a JSON configuration file.

### Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `VCO_LISTEN_ADDRS` | `/ip4/0.0.0.0/udp/4001/quic-v1` | Comma-separated list of libp2p multiaddrs to listen on. |
| `VCO_HTTP_HOST` | `127.0.0.1` | Host address for the HTTP monitoring API. |
| `VCO_HTTP_PORT` | `4000` | Port for the HTTP monitoring API. |
| `VCO_DATA_DIR` | `./relay-data` | Path to the directory for LevelDB storage. |
| `VCO_MAX_CONNECTIONS` | `256` | Maximum number of concurrent P2P connections. |
| `VCO_POW_DEFAULT_DIFFICULTY` | `0` | Minimum PoW difficulty required for envelope admission. |
| `VCO_MAX_STORE_SIZE_MB` | `0` | Maximum size of the object store in MB (0 = unlimited). |
| `VCO_CONFIG_PATH` | `undefined` | Optional path to a JSON configuration file. |

### JSON Configuration File
If `VCO_CONFIG_PATH` is set, the relay will load settings from that file. Environment variables take precedence over file settings.

```json
{
  "listenAddrs": ["/ip4/0.0.0.0/udp/4001/quic-v1"],
  "dataDir": "/var/lib/vco-relay",
  "maxStoreSizeMb": 1024,
  "pow": {
    "defaultDifficulty": 8,
    "maxDifficulty": 24,
    "windowSeconds": 3600
  }
}
```

## Getting Started

### Installation
```bash
npm install @vco/vco-relay
```

### Development
```bash
# From the project root
npm run build
cd packages/vco-relay
npm start
```

### System Installation (Linux)
A helper script is provided in the repository root to install the relay as a managed `systemd` service:

```bash
sudo ./scripts/install-relay.sh install
```

## API Documentation
Detailed API references for the relay's internal modules and interfaces are available at:
`docs/api/vco-relay/index.html`
