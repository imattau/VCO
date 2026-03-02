# Plan: Migrating VCO Social to Real Backend

## Objective
Transition `vco-social` from a mocked prototype to a real decentralized application.

## Phase 1: Infrastructure & IPC Foundation [DONE]
- [x] Task 1.1: Implement `KeyringService.ts` for persistent identity.
- [x] Task 1.2: Implement `NodeClient.ts` for Tauri sidecar IPC.
- [x] Task 1.3: Configure Tauri capabilities for shell execution.

## Phase 2: Context & State Integration [DONE]
- [x] Task 2.1: Update `SocialContext.tsx` to load identity from `KeyringService`.
- [x] Task 2.2: Implement `NodeClient` lifecycle (connect on mount, shutdown on unmount).
- [x] Task 2.3: Implement real-time envelope processing:
    - Listen for `envelope` events from `NodeClient`.
    - Decode envelopes based on schema URI.
    - Update `feed` and `conversations` states dynamically.
- [x] Task 2.4: Wire `createPost` and `sendDM` to `NodeClient.publish` using real signing keys.

## Phase 3: Deployment & Hardening [DONE]
- [x] Task 3.1: Build `vco-node` as a sidecar binary (via wrapper script).
- [x] Task 3.2: Finalize Rust-side process management in `main.rs` (enabled shell plugin).
- [x] Task 3.3: Implement "Network Status" indicators linked to `NodeClient.isReady`.

## Phase 4: Local Persistence Layer [DONE]
- [x] Task 4.1: Implement `VcoStore.ts` using **IndexedDB** to persist all received envelopes.
- [x] Task 4.2: Update `SocialContext` to hydrate `feed` and `conversations` from `VcoStore` on startup.
- [x] Task 4.3: Implement "Profile Sync": Save the user's own profile manifest to the local store and load it on bootstrap.

## Phase 5: Cross-Platform Hardening (CURRENT)
- [ ] Task 5.1: Replace bash script wrapper with a true standalone `vco-node` binary for Linux/Android.
- [ ] Task 5.2: Implement `NetworkService.ts` to handle real DHT peer lookups via the sidecar.

## Verification [DONE]
- [x] Workspace build and typecheck passing.
- [x] Sidecar configuration and permissions established.
- [x] Real-time UI status wired.

## References
- `packages/vco-node/README.md`
- `packages/vco-social/src/features/SocialContext.tsx`
