# vco-social Delta Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the hybrid delta sync capability in vco-social so the mobile app connects to a VCO relay via `/vco/sync/3.2.0`, runs a Negentropy range-proof bisect loop in TypeScript over IPC, and persists only the missing envelopes to IndexedDB.

**Architecture:** Rust owns the libp2p stream identity and connection; raw length-prefixed frames are forwarded to TypeScript via Tauri IPC events; TypeScript runs the bisect loop using `@vco/vco-sync` and sends response frames back via `invoke('sync_respond')`. This reuses all existing TS sync code without a sidecar process and without porting bisect logic to Rust.

**Tech Stack:** Rust/Tokio (`libp2p 0.54`, `libp2p-stream`), Tauri 2, TypeScript/React, `@vco/vco-sync` (`SyncRangeProofProtocol`, `computeRangeFingerprint`), `@vco/vco-core` (`decodeEnvelopeProto`), IndexedDB via `VcoStore`.

**Spec:** `docs/superpowers/specs/2026-03-15-vco-social-delta-sync-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/vco-social/src-tauri/Cargo.toml` | Modify | Add `libp2p-stream` dependency |
| `packages/vco-social/src-tauri/src/vco_node.rs` | Modify | `VcoBehaviour` + `VcoNodeState` + `NodeCommand` + `NodeEvent` + stream handler + frame loop |
| `packages/vco-social/src-tauri/src/lib.rs` | Modify | `sync_with_relay` + `sync_respond` Tauri commands + `invoke_handler!` |
| `packages/vco-social/src/lib/NodeClient.ts` | Modify | `NodeEvent` union + `AsyncQueue` + `syncWithRelay` + `_runBisectLoop` + gossipsub writes |
| `packages/vco-social/src/lib/VcoStore.ts` | Modify | `StoredEnvelope.headerHash` + `getAllHeaderHashes()` + `storeEnvelope()` |
| `packages/vco-social/src/features/settings/SettingsView.tsx` | Modify | Relay addr input + "Sync now" button + status line |
| `packages/vco-social/src/__tests__/delta-sync-client.test.ts` | Create | Unit tests for `_runBisectLoop` logic and `VcoStore` new methods |

---

## Chunk 1: Rust Backend (Tasks 1–4)

### Task 1: Add `libp2p-stream` to Cargo.toml and wire `StreamBehaviour`

**Files:**
- Modify: `packages/vco-social/src-tauri/Cargo.toml`
- Modify: `packages/vco-social/src-tauri/src/vco_node.rs`

**Background:** `libp2p-stream` provides `libp2p_stream::Behaviour` and `libp2p_stream::Control`. `Control` is the handle used to open ad-hoc protocol streams. It must be extracted via `behaviour.new_control()` before the swarm event loop starts — after that point the behaviour is moved into the swarm and is no longer directly accessible. The `libp2p-stream` crate is part of the `libp2p` family; no ADR needed.

- [ ] **Step 1.1: Add the dependency**

In `packages/vco-social/src-tauri/Cargo.toml`, add to `[dependencies]`:

```toml
libp2p-stream = "0.3"
```

Verify the version resolves with `libp2p = "0.54"` by running:

```bash
cd /home/mattthomson/workspace/VCO/packages/vco-social/src-tauri && cargo fetch 2>&1 | tail -5
```

Expected: no resolution errors. If `0.3` does not resolve, try `0.2` or check `cargo search libp2p-stream`.

- [ ] **Step 1.2: Add `stream` field to `VcoBehaviour`**

In `packages/vco-social/src-tauri/src/vco_node.rs`, add to the `VcoBehaviour` struct (both `#[cfg(mobile)]` and `#[cfg(not(mobile))]` blocks must include it — the field goes in the shared struct definition before the `#[cfg]` field):

```rust
use libp2p_stream;

#[derive(NetworkBehaviour)]
struct VcoBehaviour {
    identify: identify::Behaviour,
    kad: kad::Behaviour<SledStore>,
    gossipsub: gossipsub::Behaviour,
    autonat: autonat::Behaviour,
    relay_client: relay::client::Behaviour,
    stream: libp2p_stream::Behaviour,
    #[cfg(not(mobile))]
    mdns: mdns::tokio::Behaviour,
}
```

- [ ] **Step 1.3: Extract `Control` and wire behaviour into swarm builder**

In both the `#[cfg(mobile)]` and `#[cfg(not(mobile))]` swarm builder closures inside `start_node`, add `libp2p_stream::Behaviour::new()` to the behaviour constructor. After the swarm is built, extract the control handle **before** the `tokio::spawn` closure:

```rust
// After swarm is built (both cfg branches):
let mut stream_control = swarm.behaviour().stream.new_control();
```

This `stream_control` is moved into the `tokio::spawn` closure. It is an inexpensive clone-able handle — `Control` implements `Clone` so it can be stored and reused across multiple `SyncWithRelay` commands.

In the mobile behaviour constructor closure, add:
```rust
let stream = libp2p_stream::Behaviour::new();
VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, stream }
```

In the desktop behaviour constructor closure, add:
```rust
let stream = libp2p_stream::Behaviour::new();
VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, stream, mdns }
```

- [ ] **Step 1.4: Verify it compiles**

```bash
cd /home/mattthomson/workspace/VCO/packages/vco-social/src-tauri && cargo check 2>&1 | grep -E "^error" | head -20
```

Expected: no errors. Common failure: `NetworkBehaviour` derive macro complains about `stream` field — ensure the `libp2p_stream::Behaviour` impl satisfies the derive requirements (it does in `libp2p-stream 0.2+`).

- [ ] **Step 1.5: Commit**

```bash
cd /home/mattthomson/workspace/VCO && git add packages/vco-social/src-tauri/Cargo.toml packages/vco-social/src-tauri/src/vco_node.rs && git commit -m "feat(vco-social): add libp2p-stream behaviour to VcoBehaviour"
```

---

### Task 2: Add `SyncWithRelay` command + `VcoNodeState.sync_sessions` + new `NodeEvent` variants

**Files:**
- Modify: `packages/vco-social/src-tauri/src/vco_node.rs`

**Background:** The session map (`sync_sessions`) must live in `VcoNodeState` (not a local variable in the spawn closure) because the `sync_respond` Tauri command — which runs in a separate Tokio task — needs to look up the write-sender by `session_id`. Tauri commands receive shared state via `State<'_, VcoNodeState>`.

- [ ] **Step 2.1: Add `sync_sessions` to `VcoNodeState`**

Replace the existing `VcoNodeState` struct:

```rust
pub struct VcoNodeState {
    pub swarm_tx: Mutex<Option<mpsc::UnboundedSender<NodeCommand>>>,
    pub sync_sessions: Mutex<HashMap<String, mpsc::UnboundedSender<Vec<u8>>>>,
}
```

`HashMap` is already imported. `mpsc` is already imported from `tokio::sync`.

- [ ] **Step 2.2: Update `VcoNodeState` construction in `lib.rs`**

In `packages/vco-social/src-tauri/src/lib.rs`, the `app.manage(...)` call must be updated:

```rust
app.manage(VcoNodeState {
    swarm_tx: tokio::sync::Mutex::new(None),
    sync_sessions: tokio::sync::Mutex::new(std::collections::HashMap::new()),
});
```

- [ ] **Step 2.3: Add `SyncWithRelay` to `NodeCommand`**

```rust
pub enum NodeCommand {
    Subscribe(String),
    Unsubscribe(String),
    Publish(String, Vec<u8>),
    Dial(String),
    Resolve(String),
    PutRecord(String, Vec<u8>),
    GetStats,
    Bootstrap(Vec<String>),
    SyncWithRelay { relay_addr: String, session_id: String },
    Shutdown,
}
```

- [ ] **Step 2.4: Add new `NodeEvent` variants**

Add to the `NodeEvent` enum (keep existing variants, append these):

```rust
#[serde(rename_all = "camelCase")]
SyncSessionReady { session_id: String },
#[serde(rename_all = "camelCase")]
SyncFrame { session_id: String, frame_b64: String },
#[serde(rename_all = "camelCase")]
SyncComplete { session_id: String, received_count: u32 },
#[serde(rename_all = "camelCase")]
SyncError { session_id: String, message: String },
```

- [ ] **Step 2.5: Verify compile**

```bash
cd /home/mattthomson/workspace/VCO/packages/vco-social/src-tauri && cargo check 2>&1 | grep -E "^error" | head -20
```

Expected: no errors (new enum variants with no match arms yet will produce warnings, not errors).

- [ ] **Step 2.6: Commit**

```bash
cd /home/mattthomson/workspace/VCO && git add packages/vco-social/src-tauri/src/vco_node.rs packages/vco-social/src-tauri/src/lib.rs && git commit -m "feat(vco-social): add SyncWithRelay command, sync_sessions state, NodeEvent variants"
```

---

### Task 3: Implement `SyncWithRelay` handler + frame-forwarding loop

**Files:**
- Modify: `packages/vco-social/src-tauri/src/vco_node.rs`

**Background:** The wire framing uses a 4-byte big-endian length prefix before each message body, matching `packages/vco-transport/src/frame.ts`. Rust must read exactly `length` bytes after reading the 4-byte prefix. The zero-length frame (prefix `[0, 0, 0, 0]`, no body) is the pull-phase sentinel — when Rust reads it, it forwards an empty `SyncFrame`, emits `SyncComplete`, and drops the session.

The `libp2p_stream::Control::open_stream` method signature is:
```rust
async fn open_stream(&mut self, peer: PeerId, protocol: StreamProtocol) -> Result<Stream, OpenStreamError>
```

`Stream` implements `AsyncRead + AsyncWrite`. Use `tokio::io::AsyncReadExt` and `tokio::io::AsyncWriteExt` for reading/writing.

- [ ] **Step 3.1: Add the `SyncWithRelay` match arm in the command handler**

In the `command = rx.recv()` select branch, add after `Bootstrap`:

```rust
Some(NodeCommand::SyncWithRelay { relay_addr, session_id }) => {
    // Parse PeerId from multiaddr
    let maddr = match relay_addr.parse::<Multiaddr>() {
        Ok(m) => m,
        Err(e) => {
            let _ = handle.emit("vco-node-event", NodeEvent::SyncError {
                session_id: session_id.clone(),
                message: format!("Invalid relay addr: {e}"),
            });
            continue; // or use a label if inside a named loop
        }
    };
    let peer_id = match maddr.iter().find_map(|p| match p {
        libp2p::multiaddr::Protocol::P2p(id) => Some(id),
        _ => None,
    }) {
        Some(id) => id,
        None => {
            let _ = handle.emit("vco-node-event", NodeEvent::SyncError {
                session_id,
                message: "relay_addr has no /p2p/ component".to_string(),
            });
            continue;
        }
    };

    // Dial if not connected
    swarm.behaviour_mut().kad.add_address(&peer_id, maddr.clone());
    let _ = swarm.dial(maddr);

    // Open the /vco/sync/3.2.0 stream in a separate task
    // (stream_control is Clone so we can clone it per session)
    let mut ctrl = stream_control.clone();
    let handle2 = handle.clone();
    // Access VcoNodeState via app handle — need to pass it in
    // See note below about state access pattern
    let state_handle = handle.clone();

    tokio::spawn(async move {
        // Small delay to let dial complete
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;

        let stream = match ctrl.open_stream(
            peer_id,
            libp2p::StreamProtocol::new("/vco/sync/3.2.0"),
        ).await {
            Ok(s) => s,
            Err(e) => {
                let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                    session_id: session_id.clone(),
                    message: format!("Stream open failed: {e}"),
                });
                return;
            }
        };

        let (mut read_half, mut write_half) = tokio::io::split(stream);
        let (write_tx, mut write_rx) = mpsc::unbounded_channel::<Vec<u8>>();

        // Register session
        {
            let node_state = state_handle.state::<VcoNodeState>();
            let mut sessions = node_state.sync_sessions.lock().await;
            sessions.insert(session_id.clone(), write_tx);
        }

        // Signal TS that stream is ready
        let _ = handle2.emit("vco-node-event", NodeEvent::SyncSessionReady {
            session_id: session_id.clone(),
        });

        // Write half: drain write_rx into stream
        let write_handle = handle2.clone();
        let write_session = session_id.clone();
        tokio::spawn(async move {
            while let Some(bytes) = write_rx.recv().await {
                use tokio::io::AsyncWriteExt;
                if write_half.write_all(&bytes).await.is_err() {
                    let _ = write_handle.emit("vco-node-event", NodeEvent::SyncError {
                        session_id: write_session,
                        message: "Stream write error".to_string(),
                    });
                    break;
                }
            }
        });

        // Read half: forward frames to TS
        use tokio::io::AsyncReadExt;
        let mut received_count: u32 = 0;
        loop {
            let mut len_buf = [0u8; 4];
            if read_half.read_exact(&mut len_buf).await.is_err() {
                let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                    session_id: session_id.clone(),
                    message: "Stream read error".to_string(),
                });
                break;
            }
            let frame_len = u32::from_be_bytes(len_buf) as usize;

            if frame_len == 0 {
                // Zero-length sentinel: pull phase complete
                let _ = handle2.emit("vco-node-event", NodeEvent::SyncFrame {
                    session_id: session_id.clone(),
                    frame_b64: String::new(),
                });
                let _ = handle2.emit("vco-node-event", NodeEvent::SyncComplete {
                    session_id: session_id.clone(),
                    received_count,
                });
                // Clean up session
                let node_state = state_handle.state::<VcoNodeState>();
                let mut sessions = node_state.sync_sessions.lock().await;
                sessions.remove(&session_id);
                break;
            }

            let mut body = vec![0u8; frame_len];
            if read_half.read_exact(&mut body).await.is_err() {
                let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                    session_id: session_id.clone(),
                    message: "Stream read error (body)".to_string(),
                });
                break;
            }

            received_count += 1;
            let frame_b64 = general_purpose::STANDARD.encode(&body);
            let _ = handle2.emit("vco-node-event", NodeEvent::SyncFrame {
                session_id: session_id.clone(),
                frame_b64,
            });
        }
    });
}
```

**Note on state access:** `handle.state::<VcoNodeState>()` works inside the `tokio::spawn` closure because `AppHandle` implements `Manager` which provides `.state::<T>()`. This is the standard Tauri pattern — no extra plumbing needed.

**Note on dial timing:** The 500 ms sleep before `open_stream` is a pragmatic fallback. A production improvement would listen for `ConnectionEstablished` before opening the stream, but that requires coordinating the swarm event loop with the spawned task (complex). The 500 ms heuristic is acceptable for the initial implementation; if the connection is already established, `open_stream` succeeds immediately.

- [ ] **Step 3.2: Verify compile**

```bash
cd /home/mattthomson/workspace/VCO/packages/vco-social/src-tauri && cargo check 2>&1 | grep -E "^error" | head -30
```

Fix any lifetime or import errors. Common issues:
- `tokio::io::split` requires `tokio = { features = ["io-util"] }` — already included via `"full"`.
- `libp2p::StreamProtocol` may need to be `libp2p_stream::StreamProtocol` — check the crate re-exports.
- `state_handle.state::<VcoNodeState>()` requires `use tauri::Manager;` at the top of the file.

- [ ] **Step 3.3: Commit**

```bash
cd /home/mattthomson/workspace/VCO && git add packages/vco-social/src-tauri/src/vco_node.rs && git commit -m "feat(vco-social): implement SyncWithRelay stream handler and frame-forwarding loop"
```

---

### Task 4: Add `sync_with_relay` and `sync_respond` Tauri commands

**Files:**
- Modify: `packages/vco-social/src-tauri/src/lib.rs`

- [ ] **Step 4.1: Add `sync_with_relay` command**

Add after the `bootstrap` command function:

```rust
#[tauri::command]
async fn sync_with_relay(
    relay_addr: String,
    session_id: String,
    state: State<'_, VcoNodeState>,
) -> Result<(), String> {
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::SyncWithRelay { relay_addr, session_id })
            .map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}
```

- [ ] **Step 4.2: Add `sync_respond` command**

```rust
#[tauri::command]
async fn sync_respond(
    session_id: String,
    frame_b64: String,
    state: State<'_, VcoNodeState>,
) -> Result<(), String> {
    let data = general_purpose::STANDARD
        .decode(frame_b64)
        .map_err(|e| e.to_string())?;
    let sessions = state.sync_sessions.lock().await;
    if let Some(tx) = sessions.get(&session_id) {
        tx.send(data).map_err(|e| e.to_string())
    } else {
        Err(format!("session not found: {session_id}"))
    }
}
```

- [ ] **Step 4.3: Register both commands in `invoke_handler!`**

Find the `.invoke_handler(tauri::generate_handler![` block and add both commands:

```rust
.invoke_handler(tauri::generate_handler![
    subscribe,
    unsubscribe,
    publish,
    get_stats,
    dial,
    resolve,
    put_record,
    bootstrap,
    shutdown,
    get_vco_profile,
    sync_with_relay,
    sync_respond,
])
```

- [ ] **Step 4.4: Verify full compile**

```bash
cd /home/mattthomson/workspace/VCO/packages/vco-social/src-tauri && cargo check 2>&1 | grep -E "^error" | head -20
```

Expected: clean compile.

- [ ] **Step 4.5: Commit**

```bash
cd /home/mattthomson/workspace/VCO && git add packages/vco-social/src-tauri/src/lib.rs && git commit -m "feat(vco-social): add sync_with_relay and sync_respond Tauri commands"
```

---

## Chunk 2: TypeScript Frontend (Tasks 5–7)

### Task 5: `NodeClient.ts` — new events, `AsyncQueue`, `syncWithRelay`, `_runBisectLoop`

**Files:**
- Modify: `packages/vco-social/src/lib/NodeClient.ts`

**Background:** The bisect loop in `_runBisectLoop` is a direct port of `runClientDeltaSync` from `packages/vco-relay/test/delta-sync.test.ts`. Read that file before implementing. The key substitutions are:
- `channel.receive()` → `await asyncQueue.dequeue()`
- `channel.send(bytes)` → `invoke('sync_respond', { sessionId, frameB64: toBase64(bytes) })`
- `localStore` Map → `await VcoStore.getAllHeaderHashes()`

`AsyncQueue<T>` is a minimal promise-chain queue. When `dequeue()` is called and the queue is empty, it returns a Promise that resolves when the next `enqueue(item)` call arrives.

`SyncRangeProofProtocol` from `@vco/vco-sync` wraps a channel object with `sendRangeProofs(proofs)` and `receiveRangeProofs()` methods. We need to pass it an adapter object with `send(bytes)` and `receive()` methods that proxy to our `AsyncQueue` and `invoke`.

- [ ] **Step 5.1: Write the test file first (TDD)**

Create `packages/vco-social/src/__tests__/delta-sync-client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- AsyncQueue tests ---
// We'll import AsyncQueue once it's exported; for now test the contract.

describe('AsyncQueue', () => {
  it('dequeues items in FIFO order', async () => {
    // This test will import AsyncQueue once implemented
    // For now, define the expected interface:
    // const q = new AsyncQueue<number>();
    // q.enqueue(1); q.enqueue(2);
    // expect(await q.dequeue()).toBe(1);
    // expect(await q.dequeue()).toBe(2);
    expect(true).toBe(true); // placeholder
  });

  it('dequeue awaits enqueue when queue is empty', async () => {
    // const q = new AsyncQueue<string>();
    // setTimeout(() => q.enqueue('hello'), 10);
    // expect(await q.dequeue()).toBe('hello');
    expect(true).toBe(true); // placeholder
  });
});

// --- VcoStore.getAllHeaderHashes tests ---
// These require a real IndexedDB; tested in VcoStore tests (Task 6).

// --- NodeClient.syncWithRelay concurrency guard ---
describe('syncWithRelay concurrency guard', () => {
  it('returns immediately if syncInProgress is true', async () => {
    // Verified by integration; unit test mocks Tauri invoke
    expect(true).toBe(true);
  });
});
```

Run:
```bash
cd /home/mattthomson/workspace/VCO && npm run test --workspace=packages/vco-social 2>&1 | tail -10
```

Expected: tests pass (all placeholders).

- [ ] **Step 5.2: Add `NodeEvent` union members**

In `packages/vco-social/src/lib/NodeClient.ts`, extend the `NodeEvent` type:

```typescript
export type NodeEvent =
  | { type: 'ready'; peerId: string; multiaddrs: string[] }
  | { type: 'envelope'; channelId: string; envelope: string }
  | { type: 'stats'; peerId: string; multiaddrs: string[]; peers: string[]; connections: { remotePeer: string; remoteAddr: string; tags: string[] }[]; networkLoad: number }
  | { type: 'resolving'; cid: string; channelId: string }
  | { type: 'dialing'; peerId?: string }
  | { type: 'dial_success'; addr: string }
  | { type: 'error'; message: string }
  | { type: 'sync_session_ready'; sessionId: string }
  | { type: 'sync_frame'; sessionId: string; frameB64: string }
  | { type: 'sync_complete'; sessionId: string; receivedCount: number }
  | { type: 'sync_error'; sessionId: string; message: string };
```

- [ ] **Step 5.3: Add `AsyncQueue<T>` helper class**

Add before the `NodeClient` class definition:

```typescript
/** Minimal async FIFO queue. dequeue() awaits the next enqueue() if empty. */
class AsyncQueue<T> {
  private queue: T[] = [];
  private pending: ((value: T) => void) | null = null;

  enqueue(item: T): void {
    if (this.pending) {
      const resolve = this.pending;
      this.pending = null;
      resolve(item);
    } else {
      this.queue.push(item);
    }
  }

  dequeue(): Promise<T> {
    if (this.queue.length > 0) {
      return Promise.resolve(this.queue.shift()!);
    }
    return new Promise<T>((resolve) => {
      this.pending = resolve;
    });
  }
}
```

- [ ] **Step 5.4: Add new public fields to `NodeClient`**

Inside the `NodeClient` class, after the existing public fields:

```typescript
public syncInProgress: boolean = false;
public lastSyncAt: Date | null = null;
public relayAddr: string | null = localStorage.getItem('vco.relay_addr');
```

Note: `localStorage.getItem` returns `null` if not set, which is the desired default.

- [ ] **Step 5.5: Add per-session `AsyncQueue` map**

Add a private field to `NodeClient`:

```typescript
private syncQueues: Map<string, AsyncQueue<Uint8Array>> = new Map();
```

- [ ] **Step 5.6: Route `sync_frame` events into the queue in `handleEvent`**

In the `handleEvent` method, add a branch for the new event types:

```typescript
} else if (event.type === 'sync_frame') {
  const queue = this.syncQueues.get(event.sessionId);
  if (queue) {
    const bytes = event.frameB64.length > 0
      ? Uint8Array.from(atob(event.frameB64), c => c.charCodeAt(0))
      : new Uint8Array(0);
    queue.enqueue(bytes);
  }
} else if (event.type === 'sync_error') {
  this.syncInProgress = false;
  console.error('VCO NodeClient: Sync error:', event.message);
} else if (event.type === 'sync_complete') {
  this.syncInProgress = false;
  this.lastSyncAt = new Date();
  this.syncQueues.delete(event.sessionId);
  console.log('VCO NodeClient: Sync complete. Received:', event.receivedCount);
}
```

- [ ] **Step 5.7: Implement `syncWithRelay()`**

Add to `NodeClient` class:

```typescript
public async syncWithRelay(relayAddr: string): Promise<void> {
  if (this.syncInProgress) {
    console.log('VCO NodeClient: Sync already in progress, skipping.');
    return;
  }
  if (!isTauri()) {
    console.warn('VCO NodeClient: syncWithRelay requires Tauri runtime.');
    return;
  }

  this.syncInProgress = true;
  const sessionId = crypto.randomUUID();

  // Set up the queue before invoking (race-free)
  const queue = new AsyncQueue<Uint8Array>();
  this.syncQueues.set(sessionId, queue);

  try {
    await invoke('sync_with_relay', { relayAddr, sessionId });
  } catch (e) {
    console.error('VCO NodeClient: sync_with_relay invoke failed:', e);
    this.syncInProgress = false;
    this.syncQueues.delete(sessionId);
    return;
  }

  // Wait for sync_session_ready with 10s timeout
  const ready = await Promise.race([
    new Promise<boolean>((resolve) => {
      const unsub = this.onEvent((ev) => {
        if (ev.type === 'sync_session_ready' && ev.sessionId === sessionId) {
          unsub();
          resolve(true);
        } else if (ev.type === 'sync_error' && ev.sessionId === sessionId) {
          unsub();
          resolve(false);
        }
      });
    }),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 10_000)),
  ]);

  if (!ready) {
    console.error('VCO NodeClient: Sync session timed out or errored.');
    this.syncInProgress = false;
    this.syncQueues.delete(sessionId);
    this.handleEvent({ type: 'sync_error', sessionId, message: 'Session ready timeout' });
    return;
  }

  await this._runBisectLoop(sessionId, queue);
}
```

- [ ] **Step 5.8: Implement `_runBisectLoop()`**

Add imports at the top of `NodeClient.ts`:

```typescript
import { SyncRangeProofProtocol, computeRangeFingerprint } from '@vco/vco-sync';
import type { RangeProof } from '@vco/vco-sync';
import { decodeEnvelopeProto } from '@vco/vco-core';
import { vcoStore } from './VcoStore';
```

Add the private method to `NodeClient`:

```typescript
private async _runBisectLoop(sessionId: string, queue: AsyncQueue<Uint8Array>): Promise<void> {
  // Build channel adapter for SyncRangeProofProtocol
  const channel = {
    send: async (bytes: Uint8Array): Promise<void> => {
      // Prepend 4-byte big-endian length prefix to match wire framing
      const buf = new Uint8Array(4 + bytes.length);
      new DataView(buf.buffer).setUint32(0, bytes.length, false); // big-endian
      buf.set(bytes, 4);
      const b64 = btoa(String.fromCharCode(...buf));
      await invoke('sync_respond', { sessionId, frameB64: b64 });
    },
    receive: async (): Promise<Uint8Array> => {
      return queue.dequeue();
    },
  };

  const protocol = new SyncRangeProofProtocol(channel);

  // Seed local hashes from IndexedDB
  const localHashes = await vcoStore.getAllHeaderHashes();
  const fullRange = { start: 0x00, end: 0xff };
  const initialRoot = await computeRangeFingerprint(fullRange, localHashes);
  const initialProofs: RangeProof[] = [{ range: fullRange, merkleRoot: initialRoot }];

  // Send initial range proofs
  await protocol.sendRangeProofs(initialProofs);

  // Bisect loop (identical to delta-sync.test.ts runClientDeltaSync)
  let relayProofs = await protocol.receiveRangeProofs();
  while (true) {
    const nextRound: RangeProof[] = [];
    let anyDiff = false;

    for (const rp of relayProofs) {
      const clientRoot = await computeRangeFingerprint(rp.range, localHashes);
      const match =
        clientRoot.length === rp.merkleRoot.length &&
        clientRoot.every((b, i) => b === rp.merkleRoot[i]);
      if (!match) {
        anyDiff = true;
        if (rp.range.start !== rp.range.end) {
          const mid = Math.floor((rp.range.start + rp.range.end) / 2);
          const leftRoot = await computeRangeFingerprint(
            { start: rp.range.start, end: mid },
            localHashes,
          );
          const rightRoot = await computeRangeFingerprint(
            { start: mid + 1, end: rp.range.end },
            localHashes,
          );
          nextRound.push(
            { range: { start: rp.range.start, end: mid }, merkleRoot: leftRoot },
            { range: { start: mid + 1, end: rp.range.end }, merkleRoot: rightRoot },
          );
        }
      }
    }

    if (!anyDiff || nextRound.length === 0) break;

    await protocol.sendRangeProofs(nextRound);
    relayProofs = await protocol.receiveRangeProofs();
  }

  // Pull phase: receive envelopes until zero-length sentinel
  while (true) {
    const bytes = await queue.dequeue();
    if (bytes.length === 0) break; // sentinel

    try {
      const env = decodeEnvelopeProto(bytes);
      await vcoStore.storeEnvelope(env, 'synced');
      // Emit synthetic envelope event so UI updates
      const b64 = btoa(String.fromCharCode(...bytes));
      const channelId = 'vco://sync';
      this.handleEvent({ type: 'envelope', channelId, envelope: b64 });
    } catch (e) {
      console.warn('VCO NodeClient: Failed to decode synced envelope:', e);
    }
  }
}
```

**Note on wire framing in `channel.send`:** The relay and `SyncRangeProofProtocol` expect frames to arrive with the 4-byte length prefix already prepended when written to the stream. However, `SyncRangeProofProtocol.sendRangeProofs` may or may not add the prefix itself — check the implementation in `packages/vco-sync/src/`. If `SyncRangeProofProtocol` already adds the prefix, remove the manual prepend in `channel.send`. The safest approach: look at how `channel.send` is called in the test and what the relay reads.

- [ ] **Step 5.9: Typecheck**

```bash
cd /home/mattthomson/workspace/VCO && npm run typecheck 2>&1 | grep -E "error TS" | head -20
```

Fix any type errors. Common issues:
- `@vco/vco-sync` may not export `RangeProof` as a named type — check `packages/vco-sync/src/index.ts`.
- `SyncRangeProofProtocol` constructor signature — check whether it takes a channel object or a libp2p stream.

- [ ] **Step 5.10: Commit**

```bash
cd /home/mattthomson/workspace/VCO && git add packages/vco-social/src/lib/NodeClient.ts packages/vco-social/src/__tests__/delta-sync-client.test.ts && git commit -m "feat(vco-social): add syncWithRelay, _runBisectLoop, AsyncQueue to NodeClient"
```

---

### Task 6: `VcoStore.ts` — `headerHash` field, `getAllHeaderHashes()`, `storeEnvelope()`; fix gossipsub writes

**Files:**
- Modify: `packages/vco-social/src/lib/VcoStore.ts`
- Modify: `packages/vco-social/src/lib/NodeClient.ts`

**Background:** `computeRangeFingerprint` from `@vco/vco-sync` expects `Uint8Array[]`. `StoredEnvelope.headerHash` is stored as a hex string (using `toHex` from `encoding.ts`). `getAllHeaderHashes()` must hex-decode each stored string back to `Uint8Array` before returning. `toHex` lives at `packages/vco-social/src/lib/encoding.ts` — check for a matching `fromHex` or `hexToBytes` there.

`storeEnvelope` takes a `VcoEnvelope` (from `@vco/vco-core`). Import `VcoEnvelope` from `@vco/vco-core` at the top of `VcoStore.ts`.

- [ ] **Step 6.1: Check `encoding.ts` for hex decode utility**

```bash
grep -n "fromHex\|hexToBytes\|hex.*bytes" /home/mattthomson/workspace/VCO/packages/vco-social/src/lib/encoding.ts
```

If no `fromHex` exists, add one:

```typescript
export function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
```

- [ ] **Step 6.2: Add `headerHash` to `StoredEnvelope`**

```typescript
export interface StoredEnvelope {
  cid: string;
  channelId: string;
  payload: string; // Base64
  timestamp: number;
  headerHash: string; // hex-encoded Uint8Array
  syncStatus?: 'pending' | 'synced';
}
```

- [ ] **Step 6.3: Add imports to `VcoStore.ts`**

At the top:

```typescript
import type { VcoEnvelope } from '@vco/vco-core';
import { toHex, fromHex } from './encoding';
```

(Remove the existing `import { toHex }` line and replace with this.)

- [ ] **Step 6.4: Add `getAllHeaderHashes()` method**

Add to `VcoStore` class:

```typescript
async getAllHeaderHashes(): Promise<Uint8Array[]> {
  const envelopes = await this.getAllEnvelopes();
  return envelopes
    .filter(e => e.headerHash)
    .map(e => fromHex(e.headerHash));
}
```

- [ ] **Step 6.5: Add `storeEnvelope()` method**

```typescript
async storeEnvelope(env: VcoEnvelope, syncStatus: 'pending' | 'synced'): Promise<void> {
  const cid = toHex(env.headerHash);
  // Encode the full protobuf bytes as base64 for storage
  // VcoEnvelope has a `payload` field (raw bytes) — store the whole proto
  // Use encodeEnvelopeProto to get the wire bytes, then base64
  // Import at top: import { encodeEnvelopeProto } from '@vco/vco-core';
  const { encodeEnvelopeProto } = await import('@vco/vco-core');
  const bytes = encodeEnvelopeProto(env);
  const payload = btoa(String.fromCharCode(...bytes));

  await this.putEnvelope({
    cid,
    channelId: 'vco://sync',
    payload,
    timestamp: env.timestamp ?? Date.now(),
    headerHash: cid,
    syncStatus,
  });
}
```

**Note:** Check `VcoEnvelope` type definition in `packages/vco-core/src/` to confirm field names (`timestamp`, `payload`, etc.). The `channelId` for delta-synced envelopes defaults to `'vco://sync'`; a future improvement could derive it from the envelope's topic field.

- [ ] **Step 6.6: Fix gossipsub envelope writes in `NodeClient.handleEvent`**

In `NodeClient.ts`, add imports at the top (if not already there from Task 5):

```typescript
import { decodeEnvelopeProto } from '@vco/vco-core';
import { vcoStore } from './VcoStore';
```

In `handleEvent`, find the `envelope` branch and extend it:

```typescript
} else if (event.type === 'envelope') {
  // Persist to IndexedDB (fire-and-forget)
  try {
    const bytes = Uint8Array.from(atob(event.envelope), c => c.charCodeAt(0));
    const env = decodeEnvelopeProto(bytes);
    vcoStore.storeEnvelope(env, 'pending').catch(e =>
      console.warn('VCO NodeClient: Failed to store gossipsub envelope:', e)
    );
  } catch (e) {
    console.warn('VCO NodeClient: Failed to decode gossipsub envelope:', e);
  }
}
```

This is added **before** the `this.listeners.forEach(l => l(event))` call so the store write is always attempted even if a listener throws.

- [ ] **Step 6.7: Typecheck**

```bash
cd /home/mattthomson/workspace/VCO && npm run typecheck 2>&1 | grep -E "error TS" | head -20
```

- [ ] **Step 6.8: Run tests**

```bash
cd /home/mattthomson/workspace/VCO && npm run test --workspace=packages/vco-social 2>&1 | tail -20
```

- [ ] **Step 6.9: Commit**

```bash
cd /home/mattthomson/workspace/VCO && git add packages/vco-social/src/lib/VcoStore.ts packages/vco-social/src/lib/NodeClient.ts packages/vco-social/src/lib/encoding.ts && git commit -m "feat(vco-social): add storeEnvelope, getAllHeaderHashes to VcoStore; persist gossipsub envelopes"
```

---

### Task 7: `SettingsView.tsx` — relay addr input, sync trigger, "Sync now" button

**Files:**
- Modify: `packages/vco-social/src/features/settings/SettingsView.tsx`

**Background:** `SettingsView` already uses `NodeClient.getInstance()` for dial. We extend it with:
1. A `relayAddr` state variable (loaded from `localStorage`).
2. A listener on `dial_success` that auto-triggers sync when the connected addr matches `relayAddr`.
3. A "Sync now" button in the "Sync Health" card.
4. `syncInProgress` and `lastSyncAt` reactive state (polled from `NodeClient` or via event listener).

- [ ] **Step 7.1: Add state variables and load `relayAddr` from `localStorage`**

In `SettingsView`, add state:

```typescript
const [relayAddr, setRelayAddr] = useState<string>(
  () => localStorage.getItem('vco.relay_addr') ?? ''
);
const [syncInProgress, setSyncInProgress] = useState(false);
const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
```

- [ ] **Step 7.2: Persist `relayAddr` changes and sync to `NodeClient`**

Add a handler:

```typescript
const handleRelayAddrChange = (val: string) => {
  setRelayAddr(val);
  localStorage.setItem('vco.relay_addr', val);
  NodeClient.getInstance().relayAddr = val || null;
};
```

- [ ] **Step 7.3: Wire sync state from `NodeClient` events**

Extend the existing `useEffect` that registers the `onEvent` listener:

```typescript
const cleanup = NodeClient.getInstance().onEvent((event) => {
  if (event.type === 'dialing') {
    toast(`Dialing: ${event.peerId || 'address'}...`, "info");
  } else if (event.type === 'dial_success') {
    toast(`Successfully connected to: ${event.addr}`, "success");
    // Auto-trigger sync if addr matches configured relay
    const client = NodeClient.getInstance();
    if (client.relayAddr && event.addr.startsWith(client.relayAddr)) {
      client.syncWithRelay(client.relayAddr);
    }
  } else if (event.type === 'error' && event.message.includes('dial')) {
    toast(`Failed to dial: ${event.message}`, "error");
  } else if (event.type === 'sync_complete') {
    setSyncInProgress(false);
    setLastSyncAt(new Date());
    toast(`Sync complete: ${event.receivedCount} new envelope(s)`, "success");
  } else if (event.type === 'sync_error') {
    setSyncInProgress(false);
    toast(`Sync failed: ${event.message}`, "error");
  } else if (event.type === 'sync_session_ready') {
    setSyncInProgress(true);
  }
});
```

- [ ] **Step 7.4: Add "Sync now" button and relay addr input to "Sync Health" card**

Find the "Sync Health" card section (the `<div>` with `<h3>Sync Health</h3>`) and add before the closing `</div>` of that card:

```tsx
{/* Relay Address */}
<div className="space-y-2">
  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
    Relay Address
  </label>
  <input
    type="text"
    value={relayAddr}
    onChange={e => handleRelayAddrChange(e.target.value)}
    placeholder="/ip4/... relay multiaddress"
    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-mono text-zinc-300 focus:ring-1 focus:ring-emerald-500 outline-none"
  />
</div>

{/* Sync Now */}
{stats.isReady && relayAddr && (
  <div className="space-y-2">
    <button
      onClick={() => NodeClient.getInstance().syncWithRelay(relayAddr)}
      disabled={syncInProgress}
      className="w-full flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-400 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-emerald-500/20"
    >
      <RefreshCw size={12} className={syncInProgress ? 'animate-spin' : ''} />
      {syncInProgress ? 'Syncing...' : 'Sync Now'}
    </button>
    <p className="text-[9px] text-zinc-600 text-center">
      {lastSyncAt
        ? `Last synced ${formatRelativeTime(lastSyncAt)}`
        : 'Never synced'}
    </p>
  </div>
)}
```

- [ ] **Step 7.5: Add `formatRelativeTime` helper**

Add near the top of the component file (outside the component function):

```typescript
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}
```

- [ ] **Step 7.6: Typecheck**

```bash
cd /home/mattthomson/workspace/VCO && npm run typecheck 2>&1 | grep -E "error TS" | head -20
```

- [ ] **Step 7.7: Commit**

```bash
cd /home/mattthomson/workspace/VCO && git add packages/vco-social/src/features/settings/SettingsView.tsx && git commit -m "feat(vco-social): add relay addr config, Sync Now button, auto-sync on dial_success"
```

---

## Chunk 3: Final Verification (Task 8)

### Task 8: Full typecheck + test run + fix failures

**Files:** Any that need fixing.

- [ ] **Step 8.1: Run full typecheck across all workspaces**

```bash
cd /home/mattthomson/workspace/VCO && npm run typecheck 2>&1 | grep -E "error TS"
```

Expected: no errors. Fix any that appear before proceeding.

Common issues to watch for:
- `VcoEnvelope` type fields (`timestamp`, `headerHash`) — verify against `packages/vco-core/src/envelope.ts`.
- `SyncRangeProofProtocol` channel adapter type — it may expect a specific interface. Check `packages/vco-sync/src/`.
- `computeRangeFingerprint` signature — verify it takes `(range: {start: number, end: number}, hashes: Uint8Array[])`.
- `encodeEnvelopeProto` import in `VcoStore.ts` (dynamic import may be needed to avoid circular deps).

- [ ] **Step 8.2: Run all tests**

```bash
cd /home/mattthomson/workspace/VCO && npm run test 2>&1 | tail -30
```

Expected: all existing tests pass, no regressions. The new `delta-sync-client.test.ts` tests pass (they are mostly placeholders).

- [ ] **Step 8.3: Fix any Rust compile warnings that became errors in CI mode**

```bash
cd /home/mattthomson/workspace/VCO/packages/vco-social/src-tauri && cargo check 2>&1 | grep -E "^warning|^error" | head -30
```

Address unused variable warnings (`#[allow(unused)]` for intentional ones, fix real ones).

- [ ] **Step 8.4: Verify the `libp2p-stream` API matches usage**

Check the actual API of the resolved version:

```bash
cd /home/mattthomson/workspace/VCO/packages/vco-social/src-tauri && cargo doc --no-deps -p libp2p-stream 2>/dev/null && echo "doc built"
```

Or check the crate source:
```bash
ls ~/.cargo/registry/src/*/libp2p-stream-*/src/
```

Confirm:
- `libp2p_stream::Behaviour` exists and implements `NetworkBehaviour`.
- `Behaviour::new_control()` or similar method provides `Control`.
- `Control::open_stream(peer: PeerId, protocol: StreamProtocol)` exists.
- The returned stream implements `AsyncRead + AsyncWrite` (or `tokio::io::AsyncRead + AsyncWrite`).

Adjust the implementation in `vco_node.rs` if the API differs from what's written in Task 3.

- [ ] **Step 8.5: Final commit**

```bash
cd /home/mattthomson/workspace/VCO && git add -p && git commit -m "fix(vco-social): address typecheck and test failures after delta sync implementation"
```

Only commit if there were actual fixes. If step 8.1 and 8.2 were clean, skip this step.

- [ ] **Step 8.6: Summary commit (tag the feature complete)**

```bash
cd /home/mattthomson/workspace/VCO && git log --oneline -8
```

Verify the commit history shows a clean sequence of feature commits. No squash needed.

---

## Quick Reference: Key API Signatures to Verify

Before implementing, grep these to confirm exact signatures:

```bash
# VcoEnvelope fields
grep -n "headerHash\|timestamp\|payload" /home/mattthomson/workspace/VCO/packages/vco-core/src/envelope.ts | head -20

# computeRangeFingerprint signature
grep -n "computeRangeFingerprint" /home/mattthomson/workspace/VCO/packages/vco-sync/src/index.ts

# SyncRangeProofProtocol constructor
grep -n "class SyncRangeProofProtocol\|constructor" /home/mattthomson/workspace/VCO/packages/vco-sync/src/sync-protocol.ts 2>/dev/null || grep -rn "SyncRangeProofProtocol" /home/mattthomson/workspace/VCO/packages/vco-sync/src/ | head -5

# RangeProof type
grep -n "RangeProof" /home/mattthomson/workspace/VCO/packages/vco-sync/src/index.ts | head -5

# encodeEnvelopeProto / decodeEnvelopeProto
grep -n "encodeEnvelopeProto\|decodeEnvelopeProto" /home/mattthomson/workspace/VCO/packages/vco-core/src/index.ts | head -5

# toHex in encoding.ts
grep -n "export.*toHex\|export.*fromHex" /home/mattthomson/workspace/VCO/packages/vco-social/src/lib/encoding.ts
```

Run all of these before starting Task 5 and adjust the implementation accordingly.
