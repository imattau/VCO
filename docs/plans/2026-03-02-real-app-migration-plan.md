# Plan: Migrating VCO Social to Real Backend

## Objective
Begin the transition of `vco-social` from a mocked prototype to a real decentralized application powered by a Tauri-managed `@vco/vco-node` sidecar.

## Phase 1: Infrastructure & IPC Foundation (Current Focus)

### 1. Tauri Sidecar Configuration
- [ ] Task 1.1: Build `@vco/vco-node` as a standalone executable (e.g., using `pkg` or `nexe`, or leveraging Node.js single executable applications). *Alternative for now: Assume users have Node installed and invoke it directly via Tauri.*
- [ ] Task 1.2: Update `packages/vco-social/src-tauri/tauri.conf.json` to configure the sidecar process or command execution permissions.

### 2. Rust Backend Bridge
- [ ] Task 2.1: Update `src-tauri/src/main.rs` to spawn the `vco-node` process.
- [ ] Task 2.2: Implement `stdin`/`stdout` piping between the Rust process and the Tauri frontend via events.

### 3. Frontend IPC Client
- [ ] Task 3.1: Create `packages/vco-social/src/lib/NodeClient.ts`.
- [ ] Task 3.2: Implement methods for `subscribe`, `publish`, and `shutdown`.
- [ ] Task 3.3: Implement event listeners for `envelope`, `ready`, and `error`.

### 4. Persistent Identity (The Keyring)
- [ ] Task 4.1: Implement `KeyringService.ts` to generate and persist Ed25519 and X25519 keys securely using `localStorage` (as a fallback) or a Tauri store plugin.

## Phase 2: Wiring Contexts (Future)
- [ ] Refactor `SocialContext.tsx` to use `NodeClient` instead of `MockSocialService`.

## References
- `packages/vco-node/README.md` (for IPC protocol definition)
- `docs/plans/2026-03-02-real-app-migration-brainstorm.md`
