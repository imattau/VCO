# @vco/vco-node

The reference libp2p node implementation for the Verifiable Content Object (VCO) protocol. This package provides a standalone Node.js process that acts as the "engine room" for VCO-enabled applications, managing networking, DHT routing, and synchronization.

## Overview

`vco-node` is designed to run as a **Sidecar Process**. It abstracts the complexity of `libp2p` and the VCO transport layer, providing a simple JSON-based IPC interface over `stdin` and `stdout`. This architecture allows applications written in any language (React/Tauri, Rust, Go, etc.) to integrate with the VCO network without needing a full libp2p stack in their own memory space.

### Key Capabilities
- **Multi-Transport Support**: Primarily utilizes **QUIC-v1** for high-performance, encrypted streams.
- **Global Discovery**: Integrates **Kademlia DHT** (client mode) for peer routing and content discovery.
- **State Reconciliation**: Leverages `@vco/vco-sync` for range-based set reconciliation between peers.
- **Sidecar IPC**: Clean separation of concerns via standard I/O pipes.

---

## IPC Protocol (JSON-over-STDIO)

Applications communicate with `vco-node` by sending JSON objects followed by a newline to `stdin`, and listening for JSON objects on `stdout`.

### Commands (to Node)

#### `subscribe`
Starts listening for envelopes on a specific channel. If envelopes for this channel are already in the node's memory, they will be replayed immediately.
```json
{ "type": "subscribe", "channelId": "vco://channels/my-topic" }
```

#### `unsubscribe`
Stops listening for updates on a specific channel.
```json
{ "type": "unsubscribe", "channelId": "vco://channels/my-topic" }
```

#### `publish`
Broadcasts a signed VCO envelope to the network. The envelope must be a Base64-encoded Protobuf binary.
```json
{ 
  "type": "publish", 
  "channelId": "vco://channels/my-topic", 
  "envelope": "base64_encoded_protobuf_bytes..." 
}
```

#### `shutdown`
Triggers a graceful shutdown of the libp2p node and exits the process.
```json
{ "type": "shutdown" }
```

### Events (from Node)

#### `ready`
Emitted when the node has successfully started and bound to its network interfaces.
```json
{ 
  "type": "ready", 
  "peerId": "12D3K...", 
  "multiaddrs": ["/ip4/127.0.0.1/udp/1234/quic-v1"] 
}
```

#### `envelope`
Emitted when a new verifiable content object is received for a subscribed channel.
```json
{ 
  "type": "envelope", 
  "channelId": "vco://channels/my-topic", 
  "envelope": "base64_encoded_protobuf_bytes..." 
}
```

#### `error`
Emitted for diagnostic or fatal errors.
```json
{ "type": "error", "message": "Failed to connect to relay: ..." }
```

---

## Configuration

`vco-node` can be configured via environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `VCO_RELAY_ADDR` | Multiaddr of a bootstrap relay to connect to on startup. | (None) |

---

## Development

### Prerequisites
- Node.js v20+
- Built versions of `@vco/vco-core`, `@vco/vco-crypto`, `@vco/vco-sync`, and `@vco/vco-transport`.

### Build
```bash
npm run build
```

### Run (Standalone)
```bash
VCO_RELAY_ADDR=/ip4/1.2.3.4/udp/4001/quic-v1 node dist/main.js
```

---

## Architecture Alignment

`vco-node` is the integration point for several lower-level packages:
- **`@vco/vco-transport`**: Provides the base libp2p node factory.
- **`@vco/vco-core`**: Used for envelope validation and decoding.
- **`@vco/vco-sync`**: Orchestrates the reconciliation logic handled during inbound sync sessions.

---

*Part of the Verifiable Content Object (VCO) Ecosystem.*
