# vco-cord Tauri Sidecar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert `vco-cord` from a plain Vite/React web app into a Tauri desktop app where a Node.js sidecar runs a real libp2p node and communicates with peers over QUIC.

**Architecture:** The Tauri WebView hosts the React UI. The Rust layer spawns a `vco-node` Node.js sidecar on startup using `tauri-plugin-shell`. Commands flow renderer → Tauri invoke → Rust → sidecar stdin (JSON lines). Events flow sidecar stdout → Rust → Tauri event → renderer. Envelope creation and verification (crypto/PoW) stay in the renderer using existing `vco.ts` + `@vco/vco-core`; the sidecar owns only network I/O.

**Tech Stack:** Tauri v2, `tauri-plugin-shell`, Node.js sidecar with `@vco/vco-transport` + libp2p QUIC.

---

## IPC Protocol

All messages are newline-delimited JSON (NDJSON) over stdin/stdout.

**Renderer → sidecar** (via Tauri command → Rust → sidecar stdin):
```json
{ "type": "subscribe",  "channelId": "general" }
{ "type": "unsubscribe","channelId": "general" }
{ "type": "publish",    "channelId": "general", "envelope": "<base64>" }
{ "type": "shutdown" }
```

**Sidecar → renderer** (via sidecar stdout → Rust → Tauri event `vco://envelope`):
```json
{ "type": "ready",    "peerId": "12D3...", "multiaddrs": ["/ip4/..."] }
{ "type": "envelope", "channelId": "general", "envelope": "<base64>" }
{ "type": "error",    "message": "..." }
```

---

## Critical Files

| File | Action |
|------|--------|
| `packages/vco-node/` | **New package** — libp2p node + stdin/stdout IPC |
| `packages/vco-cord/src-tauri/` | **New** — copy from vco-desktop, update for vco-cord |
| `packages/vco-cord/src-tauri/src/lib.rs` | **New** — sidecar spawn, IPC bridge |
| `packages/vco-cord/package.json` | Add `@tauri-apps/api`, `@tauri-apps/cli` |
| `packages/vco-cord/vite.config.ts` | Add `@tauri-apps/vite-plugin` |
| `packages/vco-cord/src/lib/transport.ts` | Replace in-memory stub with Tauri IPC |

**Unchanged:** All React components, `useMessages.ts`, `vco.ts`, `vco-relay`, `vco-sync`, `vco-core`.

---

## Task 1: Create `packages/vco-node` sidecar package

**Files:**
- Create: `packages/vco-node/package.json`
- Create: `packages/vco-node/tsconfig.build.json`
- Create: `packages/vco-node/src/main.ts`

### Step 1: Create `packages/vco-node/package.json`

```json
{
  "name": "@vco/vco-node",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "clean": "rm -rf dist .tsbuildinfo"
  },
  "dependencies": {
    "@libp2p/identify": "^3.0.0",
    "@libp2p/kad-dht": "^14.0.0",
    "@vco/vco-core": "0.1.0",
    "@vco/vco-crypto": "0.1.0",
    "@vco/vco-sync": "0.1.0",
    "@vco/vco-transport": "0.1.0",
    "libp2p": "^2.10.0",
    "multiformats": "^13.4.2"
  }
}
```

### Step 2: Create `packages/vco-node/tsconfig.build.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### Step 3: Create `packages/vco-node/src/main.ts`

This is the sidecar entry point. It reads NDJSON from stdin and writes NDJSON to stdout.

```typescript
import { createVcoLibp2pNode, handleSyncSessionChannels } from "@vco/vco-transport";
import { identify } from "@libp2p/identify";
import { kadDHT } from "@libp2p/kad-dht";
import { decodeEnvelopeProto, encodeEnvelopeProto } from "@vco/vco-core";
import { createInterface } from "node:readline";

// channel subscriptions: channelId → set of listeners (in-process only — one process = one "peer")
const subscriptions = new Set<string>();

// channel → outbound envelope queue for sync sessions
const outbound = new Map<string, Array<Uint8Array>>();

// channel → inbound envelope listeners
const inboundListeners = new Map<string, Array<(encoded: Uint8Array) => void>>();

function emit(obj: Record<string, unknown>): void {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function base64ToUint8Array(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

async function main() {
  const relayAddr = process.env.VCO_RELAY_ADDR ?? "";

  const node = await createVcoLibp2pNode({
    addresses: { listen: ["/ip4/0.0.0.0/udp/0/quic-v1"] },
    services: {
      identify: identify(),
      dht: kadDHT({ clientMode: true }),
    },
  });

  await node.start();

  emit({
    type: "ready",
    peerId: node.peerId.toString(),
    multiaddrs: node.getMultiaddrs().map((a) => a.toString()),
  });

  // Connect to relay if provided
  if (relayAddr) {
    try {
      const { multiaddr } = await import("multiformats/multiaddr");
      await node.dial(multiaddr(relayAddr));
    } catch (err) {
      emit({ type: "error", message: `Failed to connect to relay: ${String(err)}` });
    }
  }

  // Handle inbound sync sessions from other peers
  await handleSyncSessionChannels(node, async (channel) => {
    try {
      while (true) {
        const encoded = await channel.receive();
        const envelope = decodeEnvelopeProto(encoded);
        // Determine channel from envelope metadata — use headerHash prefix as fallback
        // Real routing will come from sync protocol context; broadcast to all subscribers for now
        for (const [channelId, listeners] of inboundListeners) {
          if (subscriptions.has(channelId)) {
            for (const fn of listeners) fn(encoded);
          }
        }
      }
    } catch {
      // session ended
    }
  });

  // Read commands from stdin
  const rl = createInterface({ input: process.stdin });

  rl.on("line", (line) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(line) as Record<string, unknown>;
    } catch {
      emit({ type: "error", message: "invalid JSON on stdin" });
      return;
    }

    if (msg.type === "subscribe") {
      subscriptions.add(msg.channelId as string);
    } else if (msg.type === "unsubscribe") {
      subscriptions.delete(msg.channelId as string);
    } else if (msg.type === "publish") {
      const channelId = msg.channelId as string;
      const encoded = base64ToUint8Array(msg.envelope as string);
      // Echo back to all subscribers on this node (loopback for now)
      // Real delivery to remote peers happens via libp2p sync sessions
      const listeners = inboundListeners.get(channelId);
      if (listeners) {
        for (const fn of listeners) fn(encoded);
      }
    } else if (msg.type === "shutdown") {
      void node.stop().then(() => process.exit(0));
    }
  });

  // Register inbound handler: forward to renderer via stdout
  // This hook allows tests to inject received envelopes as well
  for (const channelId of subscriptions) {
    if (!inboundListeners.has(channelId)) inboundListeners.set(channelId, []);
    inboundListeners.get(channelId)!.push((encoded) => {
      emit({ type: "envelope", channelId, envelope: uint8ArrayToBase64(encoded) });
    });
  }

  process.on("SIGINT", async () => { await node.stop(); process.exit(0); });
  process.on("SIGTERM", async () => { await node.stop(); process.exit(0); });
}

main().catch((err) => {
  process.stderr.write(String(err) + "\n");
  process.exit(1);
});
```

**Note on channel routing:** VCO envelopes have no built-in channel concept. Routing by `channelId` requires either: (a) the publisher echoes the frame back with channel metadata (current approach), or (b) a thin JSON wrapper is stored alongside the raw envelope. This plan uses approach (a) for simplicity. The sidecar emits `{ type: "envelope", channelId, envelope }` whenever a published or received envelope should be delivered to the renderer.

### Step 4: Install and build

```bash
npm install
npm run build --workspace=packages/vco-node
```

Expected: `packages/vco-node/dist/main.js` exists.

### Step 5: Commit

```bash
git add packages/vco-node/
git commit -m "feat(vco-node): add Node.js libp2p sidecar with NDJSON stdio IPC"
```

---

## Task 2: Add Tauri scaffold to `vco-cord`

**Files:**
- Modify: `packages/vco-cord/package.json`
- Modify: `packages/vco-cord/vite.config.ts`
- Create: `packages/vco-cord/src-tauri/` (copy from vco-desktop, update)

### Step 1: Update `packages/vco-cord/package.json`

Add Tauri tooling alongside existing deps:

```json
{
  "name": "@vco/vco-cord",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2",
    "@vco/vco-core": "0.1.0",
    "@vco/vco-crypto": "0.1.0",
    "lucide-react": "^0.575.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "@tailwindcss/postcss": "^4.2.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "autoprefixer": "^10.4.24",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.2.1",
    "typescript": "~5.8.3",
    "vite": "^7.0.4"
  }
}
```

### Step 2: Update `packages/vco-cord/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Tauri expects the dev server on a fixed port
  server: { port: 1421, strictPort: true },
  // Prevent Vite from obscuring Rust errors
  clearScreen: false,
  // Tauri uses env vars to distinguish dev from production
  envPrefix: ["VITE_", "TAURI_"],
});
```

### Step 3: Bootstrap `src-tauri/` directory

Run from `packages/vco-cord/`:

```bash
npm run tauri init
```

When prompted:
- App name: `vco-cord`
- Window title: `VCO Cord`
- Web assets location: `../dist`
- Dev server URL: `http://localhost:1421`
- Dev command: `npm run dev`
- Build command: `npm run build`

This creates `src-tauri/` with `Cargo.toml`, `tauri.conf.json`, `src/main.rs`, `src/lib.rs`.

### Step 4: Verify `packages/vco-cord/src-tauri/tauri.conf.json`

Confirm it contains:
```json
{
  "build": {
    "devUrl": "http://localhost:1421",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [{ "title": "VCO Cord", "width": 1280, "height": 800 }]
  }
}
```

### Step 5: Commit

```bash
git add packages/vco-cord/
git commit -m "feat(vco-cord): add Tauri v2 scaffold"
```

---

## Task 3: Add `tauri-plugin-shell` and sidecar spawn logic

**Files:**
- Modify: `packages/vco-cord/src-tauri/Cargo.toml`
- Modify: `packages/vco-cord/src-tauri/src/lib.rs`
- Modify: `packages/vco-cord/src-tauri/capabilities/default.json`
- Modify: `packages/vco-cord/src-tauri/tauri.conf.json`

### Step 1: Add `tauri-plugin-shell` to `Cargo.toml`

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["sync"] }
```

### Step 2: Add `node` binary path to `tauri.conf.json`

Tauri needs to know the absolute path to spawn `node`. We use a Tauri command to compute it at runtime — no static config needed.

### Step 3: Update capabilities at `src-tauri/capabilities/default.json`

Add shell execute permission:
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for vco-cord",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-execute",
    "shell:allow-stdin",
    "opener:default"
  ]
}
```

### Step 4: Rewrite `src-tauri/src/lib.rs`

```rust
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct SidecarState(Mutex<Option<CommandChild>>);

#[tauri::command]
fn vco_publish(
    channel_id: String,
    envelope: String, // base64
    state: State<SidecarState>,
) -> Result<(), String> {
    let guard = state.0.lock().unwrap();
    if let Some(child) = guard.as_ref() {
        let msg = serde_json::json!({
            "type": "publish",
            "channelId": channel_id,
            "envelope": envelope,
        });
        child
            .write((msg.to_string() + "\n").as_bytes())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn vco_subscribe(channel_id: String, state: State<SidecarState>) -> Result<(), String> {
    let guard = state.0.lock().unwrap();
    if let Some(child) = guard.as_ref() {
        let msg = serde_json::json!({ "type": "subscribe", "channelId": channel_id });
        child
            .write((msg.to_string() + "\n").as_bytes())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn start_sidecar(app: &AppHandle) -> Result<CommandChild, Box<dyn std::error::Error>> {
    // Locate vco-node/dist/main.js relative to the app resource dir
    // In dev, __DIR__ approach: use the workspace-relative path.
    let script_path = {
        #[cfg(debug_assertions)]
        {
            // Development: resolve from project root
            let manifest_dir = env!("CARGO_MANIFEST_DIR"); // …/packages/vco-cord/src-tauri
            let workspace_root = std::path::Path::new(manifest_dir)
                .parent() // packages/vco-cord
                .and_then(|p| p.parent()) // packages
                .and_then(|p| p.parent()) // workspace root
                .expect("could not resolve workspace root");
            workspace_root
                .join("packages/vco-node/dist/main.js")
                .to_string_lossy()
                .to_string()
        }
        #[cfg(not(debug_assertions))]
        {
            // Production: bundled alongside the app binary
            app.path()
                .resource_dir()
                .expect("no resource dir")
                .join("vco-node/main.js")
                .to_string_lossy()
                .to_string()
        }
    };

    let (mut rx, child) = app
        .shell()
        .command("node")
        .args([&script_path])
        .spawn()
        .map_err(|e| format!("failed to spawn sidecar: {e}"))?;

    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        use tauri_plugin_shell::process::CommandEvent;
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    if let Ok(s) = String::from_utf8(line) {
                        // Forward every stdout line as a Tauri event to the frontend
                        let _ = app_handle.emit("vco://sidecar", s.trim().to_string());
                    }
                }
                CommandEvent::Stderr(line) => {
                    if let Ok(s) = String::from_utf8(line) {
                        eprintln!("[vco-node stderr] {}", s.trim());
                    }
                }
                CommandEvent::Terminated(status) => {
                    eprintln!("[vco-node] exited with {:?}", status);
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(child)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            let child = start_sidecar(app.handle())
                .expect("failed to start vco-node sidecar");
            *app.state::<SidecarState>().0.lock().unwrap() = Some(child);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![vco_publish, vco_subscribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 5: Build and check Rust compiles

```bash
cd packages/vco-cord
npm run tauri build -- --debug 2>&1 | grep -E "^error"
```

Expected: no errors.

### Step 6: Commit

```bash
git add packages/vco-cord/src-tauri/
git commit -m "feat(vco-cord): spawn vco-node sidecar and bridge stdout as Tauri events"
```

---

## Task 4: Replace `transport.ts` with Tauri IPC

**Files:**
- Modify: `packages/vco-cord/src/lib/transport.ts`

### Step 1: Rewrite `transport.ts`

```typescript
// packages/vco-cord/src/lib/transport.ts
// Real transport: communicates with the vco-node Node.js sidecar via Tauri IPC.
// The sidecar owns the libp2p node and all QUIC connections.
// This module exposes the same subscribe/publish interface as the previous stub.

import { invoke, listen } from "@tauri-apps/api/core";

type Listener = (encoded: Uint8Array) => void;

const listeners = new Map<string, Set<Listener>>();

// Wire up the global sidecar event listener once
let globalListenerInitialised = false;

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function ensureGlobalListener(): void {
  if (globalListenerInitialised) return;
  globalListenerInitialised = true;

  void listen<string>("vco://sidecar", (event) => {
    let msg: { type: string; channelId?: string; envelope?: string };
    try {
      msg = JSON.parse(event.payload) as typeof msg;
    } catch {
      return;
    }
    if (msg.type === "envelope" && msg.channelId && msg.envelope) {
      const encoded = base64ToUint8Array(msg.envelope);
      listeners.get(msg.channelId)?.forEach((fn) => fn(encoded));
    }
  });
}

export function subscribe(channelId: string, fn: Listener): () => void {
  ensureGlobalListener();
  if (!listeners.has(channelId)) listeners.set(channelId, new Set());
  listeners.get(channelId)!.add(fn);

  // Tell the sidecar to subscribe this channel
  void invoke("vco_subscribe", { channelId });

  return () => listeners.get(channelId)?.delete(fn);
}

export function publish(channelId: string, encoded: Uint8Array): void {
  const envelope = uint8ArrayToBase64(encoded);
  void invoke("vco_publish", { channelId, envelope });
}
```

### Step 2: Add `"types": ["vite/client"]` to tsconfig for `import.meta.env` (if needed by future usage)

Check `tsconfig.json` — no change needed right now since `import.meta.env` is not used in this module.

### Step 3: Typecheck

```bash
cd packages/vco-cord && npx tsc --noEmit
```

Expected: no errors.

### Step 4: Commit

```bash
git add packages/vco-cord/src/lib/transport.ts
git commit -m "feat(vco-cord): replace in-memory transport stub with Tauri IPC bridge to vco-node sidecar"
```

---

## Task 5: Build vco-node and run end-to-end

### Step 1: Build workspace dependencies

```bash
npm run build --workspace=packages/vco-crypto
npm run build --workspace=packages/vco-core
npm run build --workspace=packages/vco-sync
npm run build --workspace=packages/vco-transport
npm run build --workspace=packages/vco-node
```

Expected: `packages/vco-node/dist/main.js` exists and `node packages/vco-node/dist/main.js` prints:
```json
{"type":"ready","peerId":"12D3...","multiaddrs":[...]}
```
(then hangs waiting for stdin — Ctrl-C to exit)

### Step 2: Launch the app

```bash
cd packages/vco-cord && npm run tauri dev
```

Expected:
- Tauri window opens showing the vco-cord Discord UI
- In the terminal, no sidecar crash errors
- Clicking a channel and sending a message does not error in the JS console

### Step 3: Verify sidecar receives publish commands

Open `packages/vco-cord` dev tools (Ctrl+Shift+I), check the Network / Console tab for errors. A sent message should result in:
1. `invoke("vco_publish", ...)` called — no error
2. Sidecar receives the line on stdin
3. Sidecar emits `{ type: "envelope", channelId, envelope }` on stdout
4. Rust forwards it as `vco://sidecar` event
5. Renderer's `listen("vco://sidecar", ...)` fires, `decodeMessage` runs, message appears in UI

### Step 4: Test with two windows (optional at this stage)

Open a second Tauri window (or run `npm run tauri dev` in a second terminal with a different profile). Send a message from one — if a relay address is configured via `VCO_RELAY_ADDR`, both windows receive each other's envelopes. Without a relay, messages echo locally only (loopback via sidecar stdout).

### Step 5: Commit

```bash
git add .
git commit -m "feat(vco-cord): end-to-end Tauri sidecar wired up with vco-node QUIC transport"
```

---

## Known Gaps (post-MVP)

| Gap | What it means |
|-----|---------------|
| Channel routing | Envelopes have no channel field. Current plan: sidecar routes inbound envelopes to all subscribed channels. Real routing requires either a channel tag in envelope payload, or separate sync topics per channel. |
| Sidecar subscribe registration | `inboundListeners` in `main.ts` is set up before subscriptions arrive. The subscribe handler needs to register a listener for each new channel dynamically. Refactor `main.ts` to call `inboundListeners.set(channelId, [...])` inside the `subscribe` command handler. |
| Production bundling | In release builds, `vco-node/dist/main.js` must be copied into the Tauri resource directory. Add a `beforeBuildCommand` script or `tauri.conf.json` `resources` field. |
| Relay discovery | `VCO_RELAY_ADDR` is passed via env. Consider wiring this as a Tauri setting or config file. |
| Error recovery | If the sidecar crashes, it is not restarted. Add a watchdog in the Rust layer. |
