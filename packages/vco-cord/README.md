![VCO Logo](../../VCO_Logo.png)

# VCO Cord (vco-cord)

VCO Cord is a lightweight, experimental desktop client for the Verifiable Content Object protocol.

## Features

- **Decentralized Chat**: Direct P2P messaging using the `@vco/vco-schemas` and `@vco/vco-core` packages.
- **Relay Interop**: Seamless interaction with VCO relays for message propagation.
- **Identity First**: Cryptographic authorship for every message.

## Development

To start the development environment:

```bash
# From the project root
npm run tauri dev --workspace=@vco/vco-cord
```

To build the application for distribution:

```bash
# From the project root
npm run tauri build --workspace=@vco/vco-cord
```
