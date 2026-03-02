# Brainstorming: Migrating `vco-social` to a Real Libp2p Backend

**Objective**: Transition `vco-social` from the simulated `MockSocialService` to a real, decentralized architecture powered by `@vco/vco-node` running as a Tauri sidecar or integrated web node.

## Current State vs. Target State

### Current (Simulated)
- **Data**: In-memory `Map` (via `@vco/vco-testing`).
- **Network**: `setTimeout` delays and mock event loops.
- **Crypto**: Real crypto primitives (`@vco/vco-crypto`) are used, but keys are ephemerally generated or hardcoded on load.
- **IPC**: None.

### Target (Real App)
- **Data**: Real persistence (IndexedDB for web, local filesystem via Tauri for desktop/mobile).
- **Network**: Real libp2p connections (QUIC/WSS) via `@vco/vco-node`.
- **Crypto**: Secure, persistent local key storage.
- **IPC**: Tauri commands (Rust to JS) or direct Wasm/WebRTC bindings to the node.

## Integration Architecture (The "Sidecar" Pattern)
Since `vco-social` is built as a Tauri app (for Android/Desktop), the most robust architecture is:
1. **Frontend (React)**: Handles UI, renders data, manages local caching (IndexedDB/Redux).
2. **Backend (Tauri Rust)**: Spawns and manages the `@vco/vco-node` process as a sidecar.
3. **IPC Bridge**: React sends JSON commands (`publish`, `subscribe`) to Tauri -> Tauri pipes to Node. Node sends events (`envelope`, `sync`) to Tauri -> Tauri emits to React.

## Critical Paths

### 1. The Keyring (Identity Persistence)
- We need a real way to generate and store the Ed25519 identity and X25519 encryption keys across sessions.
- In `vco-desktop`, this is stored in `localStorage`. For a production social app, it should be in the OS secure enclave (via Tauri plugin) or at least securely encrypted on disk.

### 2. The Node IPC Client
- We need a `NodeClient.ts` in the frontend that wraps the `window.__TAURI__.event.listen` and `invoke` calls to communicate with the libp2p sidecar.

### 3. Replacing MockSocialService
- Create `RelayFeedService.ts` which uses the `NodeClient` to publish and subscribe to specific topic channels (e.g., `vco://channels/social/global`).

## Initial Actions for Transition
1. **Define the Node sidecar in Tauri**: Configure `tauri.conf.json` to bundle `vco-node` as a sidecar binary.
2. **Create the IPC Client**: Build the TypeScript bridge.
3. **Persist Identity**: Implement real key storage.

**Recommendation**: Start by configuring the Tauri sidecar for the Node.js `vco-node` and building the basic IPC bridge in React.
