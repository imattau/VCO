![VCO Logo](../../VCO_Logo.png)

# @vco/vco-relay

A standalone bootstrap relay and storage server for the Verifiable Content Object protocol.

## Features

- **P2P Relay**: Bootstraps peer discovery and message propagation.
- **Persistent Storage**: LevelDB-backed object store for durable content.
- **Admission Policies**: Configurable PoW and ZKP-based content filtering.
- **Health Monitoring**: Built-in HTTP monitoring and control interface.

## Installation

```bash
# Install as a system service
sudo ./scripts/install-relay.sh install
```

Or as a node module:

```bash
npm install @vco/vco-relay
```
