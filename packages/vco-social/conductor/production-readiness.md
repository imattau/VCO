# Implementation Plan: Comprehensive Production Readiness

## Objective
Address the remaining architectural, scalability, and UX gaps in the VCO Social application to elevate it from a functional prototype to a fully production-ready release. 

## Scope & Impact
This is a comprehensive overhaul touching both the Rust libp2p backend and the React/Tauri frontend. The changes will ensure data resilience, network reliability on mobile, and smooth performance as user data grows.

## Implementation Steps

### Phase 1: Critical Backend Resilience (Rust/libp2p)
1. **DHT Persistence:**
   - Replace `MemoryStore` in Kademlia with a persistent disk-backed store (e.g., using `sled` or implementing a custom `RecordStore` backed by SQLite/Tauri's app data directory).
   - Ensure published records and cached peer profiles survive app restarts.
2. **Network Bootstrapping & Peer Caching:**
   - Implement peer address caching to disk upon successful connection.
   - On startup, load cached peers into the routing table before relying on hardcoded DNS seed nodes.
3. **NAT Traversal & Relay Support:**
   - Add `libp2p::autonat` and `libp2p::relay` (Circuit Relay V2 client) to the `VcoBehaviour`.
   - Configure the swarm to listen on relay addresses if public IPs are unavailable, allowing mobile clients behind strict NATs to receive Direct Messages.

### Phase 2: Core Frontend Architecture (Data & Memory)
4. **Feed Scalability (Pagination & Virtualization):**
   - Update `VcoStore.ts` to support cursor-based pagination for Envelopes and Notifications.
   - Refactor `SocialContext.tsx` to stop loading the entire database into memory. Implement an infinite scroll hook.
   - Use a library like `react-window` or `react-virtuoso` in `FeedView.tsx` to render only visible DOM nodes.
5. **Media Storage & Eviction:**
   - Implement an LRU (Least Recently Used) cache eviction policy in `VcoStore.ts` to delete old media blobs when IndexedDB usage exceeds a safe threshold (e.g., 500MB).
   - *Alternative:* Migrate blob storage to the native filesystem using Tauri file APIs to avoid browser quota limits altogether.

### Phase 3: Identity & UX Safety
6. **Identity Export/Recovery:**
   - Update `KeyringService.ts` to allow exporting the identity as an encrypted JSON file or generating a mnemonic Seed Phrase (BIP39).
   - Add an "Export Identity" section in `SettingsView.tsx` and an "Import Identity" option in the `AuthView.tsx` onboarding flow.
7. **React Error Boundaries:**
   - Create a global `<ErrorBoundary>` component.
   - Wrap the main application routes and critical modules (like the Feed and Messaging views) to catch render crashes and provide a friendly "Reload" UI instead of a white screen.

### Phase 4: Standardization & Testing
8. **Protocol Versioning:**
   - Extract hardcoded strings like `vco://channels/social/global` and schema URIs into a centralized `constants.ts` file.
   - Allow the app to switch between `testnet` and `mainnet` protocol prefixes via environment variables.
9. **End-to-End Testing:**
   - Set up WebdriverIO or Playwright configured to run against the Tauri development binary.
   - Write core E2E flows: Account creation, posting to the feed, and sending a DM.

## Verification & Testing
- **Backend:** Restart the app and verify previous peer profiles resolve instantly without network queries.
- **Frontend:** Generate 10,000 mock posts and verify the app UI remains 60fps and memory stays stable using Chrome DevTools.
- **Auth:** Successfully wipe IndexedDB, then recover the account using an exported key phrase.
- **Network:** Connect two devices on separate cellular networks (behind NAT) and successfully exchange DMs using circuit relays.

## Rollback Strategy
Each phase should be developed and merged in isolated feature branches to ensure the app remains stable. The backend changes (Phase 1) should be thoroughly tested via Rust unit tests before altering the frontend expectations.