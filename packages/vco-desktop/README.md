![VCO Logo](../../VCO_Logo.png)

# VCO Desktop (vco-desktop)

VCO Desktop is the primary cross-platform user interface for the Verifiable Content Object protocol, built using **Tauri**, **React**, and **TypeScript**.

## Features

- **P2P Sync**: Direct peer-to-peer data synchronization using the VCO protocol.
- **Verifiable Identity**: Built-in support for Ed25519 multikeys and identity management.
- **Local Relay**: Optional built-in relay capability for decentralized operation.
- **Secure by Design**: Cryptographic verification of all content objects.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Development

To start the development environment:

```bash
# From the project root
npm run tauri dev --workspace=@vco/vco-desktop
```

To build the application for distribution:

```bash
# From the project root
npm run tauri build --workspace=@vco/vco-desktop
```
