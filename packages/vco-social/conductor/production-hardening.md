# Implementation Plan: Production Hardening

## Objective
Investigate and rectify incomplete, demonstration, or mock functionality within the VCO Social app to bring it closer to production readiness.

## Key Files & Context
- `src/features/SocialContext.tsx`
- `src-tauri/src/vco_node.rs`
- `src-tauri/src/lib.rs`
- `src/lib/NodeClient.ts`

## Proposed Solution
The codebase contains several "demo-level" placeholders that compromise security, stability, or UX in a production environment. We will address them as follows:

1. **Dynamic Proof-of-Work Difficulty:** 
   - *Issue:* `powDifficulty` is hardcoded to `1` in multiple places in `SocialContext.tsx`. This is insecure and doesn't scale with message size or network conditions.
   - *Solution:* Implement a `calculateDifficulty` helper in the frontend. 
     - **Base Difficulty:** Use a base of `10` for production-level spam protection.
     - **Size Scaling:** Add `Math.floor(Math.log2(payloadLength / 1024 + 1))` to penalize large messages and discourage blob-spamming.
     - **Network Factor:** The backend Rust node will now report a `networkLoad` factor in its periodic stats, derived from recent message volume. The frontend will adjust difficulty using this factor.
2. **Fake Bootstrap Nodes:**
   - *Issue:* `SocialContext.tsx` uses a totally fake placeholder node (`/dnsaddr/bootstrap.vco.network/p2p/12D3Koo...b4j8`).
   - *Solution:* Remove the fake placeholder. Default the bootstrap array to empty so the node doesn't endlessly attempt to dial a non-existent host.
3. **Incomplete Node Lifecycle (Shutdown):**
   - *Issue:* `NodeClient.ts` has a `shutdown()` method that only sets `isReady = false`. It leaves the Rust libp2p node running as an orphaned background task.
   - *Solution:* Add a `NodeCommand::Shutdown` to the Rust backend (`vco_node.rs` and `lib.rs`). Update `NodeClient.ts` to invoke `shutdown` via Tauri IPC, allowing the async swarm loop in Rust to break and terminate cleanly.
4. **Placeholder Connection Metadata:**
   - *Issue:* The `get_stats` routine in `vco_node.rs` hardcodes `"unknown"` for the `remote_addr`.
   - *Solution:* Track actual remote addresses by observing `SwarmEvent::ConnectionEstablished` and storing a mapping of `PeerId` to `Multiaddr`. Use this mapping to populate real addresses in `ConnectionInfo`.
5. **DHT Reliability:**
   - *Issue:* `Quorum::One` is used for Kademlia `put_record`.
   - *Solution:* Increase the quorum to `Quorum::Majority` (or at least `3`) to ensure network redundancy in production.

## Implementation Steps
1. In `src-tauri/src/vco_node.rs`:
   - Add `Shutdown` to `NodeCommand` enum.
   - Add a `HashMap<PeerId, Multiaddr>` to track connected peer addresses. Update it on `ConnectionEstablished` and `ConnectionClosed`.
   - Update `get_stats` to provide actual remote addresses.
   - Break the main async loop when `NodeCommand::Shutdown` is received.
2. In `src-tauri/src/lib.rs`, expose a new `#[tauri::command] async fn shutdown` to send the `Shutdown` command.
3. In `src/lib/NodeClient.ts`, update `shutdown()` to invoke `shutdown` via Tauri IPC.
4. In `src/features/SocialContext.tsx`:
   - Implement `calculateDifficulty(payload: Uint8Array, networkLoad?: number): number`.
   - Use this helper for all `createEnvelope` calls.
   - Clear the fake bootstrap node array.

## Verification & Testing
- Compile and run the app. Ensure creating posts now takes slightly more CPU time due to the increased PoW difficulty.
- Verify the UI network stats show actual multiaddresses instead of `"unknown"` for connected peers.
- Invoke the node shutdown sequence (or close the app) and verify the Rust log indicates the libp2p node task terminated.
- Verify no more resolution errors for `bootstrap.vco.network`.
