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

## Phase 3: Deployment & Hardening (CURRENT)
- [ ] Task 3.1: Build `vco-node` as a sidecar binary.
- [ ] Task 3.2: Finalize Rust-side process management in `main.rs`.
- [ ] Task 3.3: Implement "Network Status" indicators linked to `NodeClient.isReady`.

## References
- `packages/vco-node/README.md`
- `packages/vco-social/src/features/SocialContext.tsx`
