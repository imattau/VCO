![VCO Header](./VCO_header.png)

# VCO (Verifiable Content Object) Protocol

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@vco/vco-core.svg?style=flat-squash)](https://www.npmjs.com/package/@vco/vco-core)

VCO is a Layer 3.5 protocol designed for high-performance, verifiable, and decentralized content synchronization. It provides a modular, library-first workspace for building robust peer-to-peer applications.

## Project Overview

VCO (v3.2) is built on a "Verifiable Content" model where every piece of data (Envelope) carries its own proof of integrity, authorship, and optionally, Proof-of-Work (PoW) or Zero-Knowledge Proof (ZKP) authorization.

### Key Features

- **Verifiable Envelopes**: Built-in support for Ed25519 signatures, ZKP-based authorization, and Proof-of-Work rate-limiting.
- **Efficient Sync**: Range-based set reconciliation (based on negentropy principles) for fast data synchronization over unreliable networks.
- **Modular Architecture**: Separated into core, crypto, transport, and sync layers for maximum reusability.
- **Protocol Buffers**: Strict wire-format compliance using Proto3 for all envelope and sync data.
- **Transport Agnostic**: High-performance libp2p-based transport with QUIC, Noise, and Yamux.

### Workspace Structure

| Package | Description |
| :--- | :--- |
| [`@vco/vco-core`](./packages/vco-core) | Envelope schema, validation logic, and ZKP/PoW interfaces. |
| [`@vco/vco-crypto`](./packages/vco-crypto) | Cryptographic primitives and Noble-based adapters. |
| [`@vco/vco-sync`](./packages/vco-sync) | Range-based set reconciliation and sync state machines. |
| [`@vco/vco-transport`](./packages/vco-transport) | Libp2p adapters, session management, and TOL (Transport Obfuscation Layer). |
| [`@vco/vco-relay`](./packages/vco-relay) | A standalone bootstrap relay and storage server. |
| [`@vco/vco-desktop`](./packages/vco-desktop) | A cross-platform desktop application (Tauri + React). |

---

## Installation

VCO is managed as a monorepo using NPM workspaces.

### Prerequisites

- **Node.js**: v18 or higher
- **NPM**: v8 or higher
- **Git**
- **Rust** (for desktop app development)

### Setup

```bash
# Clone the repository
git clone https://github.com/imattau/VCO.git
cd VCO

# Install dependencies
npm install

# Build the project (generates Protobuf bindings and compiles TypeScript)
npm run build
```

---

## Usage Examples

### 1. Creating and Validating an Envelope

```typescript
import { createEnvelope, validateEnvelope, VCOCore } from '@vco/vco-core';
import { NobleCryptoProvider } from '@vco/vco-crypto';

const crypto = new NobleCryptoProvider();
const core = new VCOCore(crypto);

// Create a signed envelope
const envelope = createEnvelope({
  payload: new TextEncoder().encode("Hello VCO"),
  payloadType: 1, // e.g., plain text
  creatorId: myPublicKey,
  privateKey: myPrivateKey,
}, crypto);

// Validate integrity and signature
const isValid = await core.validateEnvelope(envelope);
console.log(`Is valid: ${isValid}`);
```

### 2. Running the Relay Server

The relay server can be installed on a Linux system using the provided installer:

```bash
sudo ./scripts/install-relay.sh install
```

Or run manually from the workspace:

```bash
cd packages/vco-relay
VCO_CONFIG_PATH=./config.json npm start
```

### 3. Running the Desktop App

To start the desktop application in development mode:

```bash
# Requires Rust installed
npm run tauri dev --workspace=@vco/vco-desktop
```

---

## Documentation

- **[Specification](./SPEC.md)**: Detailed wire-format and protocol rules.
- **[Architecture](./docs/architecture.md)**: High-level system design.
- **[Relay Design](./docs/plans/2026-02-24-vco-relay-design.md)**: Technical overview of the relay server.
- **[ADRs](./docs/adr/)**: Architectural Decision Records.

---

## Contribution Guidelines

We welcome contributions to the VCO protocol! Please adhere to our mandatory engineering policies:

1.  **Library First**: Prefer standard/platform libraries over custom code.
2.  **Schema Compliance**: All wire-format changes must be made in `proto/vco/v3/vco.proto`.
3.  **Modular Boundaries**: Keep packages decoupled and APIs narrow.
4.  **Test Driven**: Every feature or fix must include unit and integration tests.

For detailed guidelines, please refer to **[AGENTS.md](./AGENTS.md)**.

---

## Contributors

- **Gemini** (AI Agent) - Automated installer, relay enhancements, and protocol refinements.
- **lostcause** - Lead architect and developer.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
