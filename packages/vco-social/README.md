# VCO Social

VCO Social is a production-ready, decentralized social network prototype built on top of the **libp2p** protocol and the **Tauri v2** framework. It leverages a high-performance Rust networking core for swarm-based communication while providing a modern, fluid user experience through a React-based frontend.

## Key Features

- **Decentralized Feed:** Content is broadcast via **libp2p Gossipsub** and indexed locally for low-latency browsing.
- **Swarm Identity:** Persistent cryptographic identities stored in the application's configuration directory.
- **Real-time Peer Discovery:** Automatic local network discovery via **MDNS** and global routing through a **Kademlia DHT**.
- **End-to-End Encryption (E2EE):** Direct messages are secured using **X25519** and **AES-GCM**, ensuring only participants can read private conversations.
- **Offline-First Storage:** All social data is persisted in a local **IndexedDB** instance (`vcoStore`), allowing for a seamless experience even without an active network connection.
- **Secure by Default:** Strict Content Security Policy (CSP) and local manifest signing for all social objects.

## Architecture

VCO Social follows a dual-layer architecture:

1.  **Networking Core (Rust):** A standalone libp2p node that handles identity persistence, peer discovery, and swarm-based message routing.
2.  **Application Layer (React/TypeScript):** A responsive UI that communicates with the networking core via Tauri's IPC mechanism.

## 🔐 Security Model
VCO Social implements a decentralized "Web-of-Trust" security model:
- **Identity Encryption:** All private keys are encrypted at rest in the browser's storage using **AES-GCM (256-bit)**. The encryption key is derived from your passphrase via **PBKDF2** (100,000 iterations).
- **Verifiable Objects:** Every post, reply, and profile update is wrapped in a cryptographic **Envelope**.
- **Integrity:** All objects are identified by their **Blake3** CID. The UI verifies that the CID matches the content and that the signature is valid before displaying any data.
- **E2EE Messaging:** Direct messages are encrypted using **X25519** (Diffie-Hellman key exchange) and **AES-GCM**.

## Development Setup

### Prerequisites

To build and run VCO Social, you will need:

- **Node.js:** v20+ and `npm`.
- **Rust:** Latest stable version via `rustup`.
- **Tauri CLI:** `npm install -g @tauri-apps/cli`.
- **Android Studio & NDK:** Required for Android development (ensure `ANDROID_HOME` and `ANDROID_NDK_HOME` are set).

### 1. Web Development (Browser-only Mock)

For UI development without the networking core, run the Vite development server:

```bash
npm install
npm run dev
```

### 2. Desktop (Linux/macOS/Windows)

To run the full decentralized application on your desktop:

```bash
# Development mode with hot-reloading
npm run tauri dev

# Build a production package
npm run tauri build
```

### 3. Android

The Android environment is designed for flexibility and environment discovery.

```bash
# Run on a connected emulator or device
npm run tauri android dev

# Generate a debug APK
npm run tauri android build
```

#### Android Connectivity Troubleshooting
If you encounter "Failed to request" or "Connection refused" errors on Android:
- **Emulator:** The Android emulator uses `10.0.2.2` to refer to your PC's localhost. Ensure the `devUrl` in `tauri.conf.json` is accessible.
- **Physical Device:** Ensure your phone and PC are on the same Wi-Fi network. You must replace `localhost` in `tauri.conf.json`'s `devUrl` with your PC's local IP address (e.g., `http://192.168.1.50:5173`).
- **Firewall:** Ensure your PC's firewall allows inbound traffic on port `5173`. Run `sudo ufw allow 5173/tcp` if necessary.

*Note: The project's CSP is pre-configured to allow connections to `10.0.2.2` and common local network ranges.*

### 4. Development Utilities

To ensure code quality and type safety:

```bash
# Run TypeScript type-checking
npm run typecheck
```

## 🧪 Integration Testing
To run the decentralized networking integration tests, invoke the manual test runner:
```bash
# In the browser console / dev environment
import { runNetworkingIntegrationTest } from './src/__tests__/Networking.test';
await runNetworkingIntegrationTest();
```
The test verifies swarm connectivity, pub/sub behavior, and message loopback via the decentralized network.

## Key Networking Protocols

- **Gossipsub v1.2:** Efficient multi-hop message broadcasting.
- **Kademlia DHT:** Decentralized peer and object resolution.
- **MDNS:** Local network discovery for zero-configuration swarm entry.
- **QUIC & TCP:** Multi-protocol transport support for maximum connectivity.

## Verification & Integrity

All social objects (Posts, Profiles, Replies) are wrapped in a **VCO Envelope** that includes:
- **Cryptographic Signature:** Verifies the author's identity.
- **CID (Content IDentifier):** Ensures data integrity through BLAKE3 hashing.
- **Proof of Work (PoW):** Prevents spam and resource exhaustion on the swarm.

---

*VCO Social is part of the VCO Ecosystem.*
