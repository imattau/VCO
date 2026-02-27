# vco-cord Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold `packages/vco-cord/` — a Discord-style Tauri + React desktop app that showcases VCO protocol with real crypto and in-memory transport.

**Architecture:** Hybrid modular layout: shared UI primitives in `components/ui/`, domain logic in `features/` (identity, servers, channels, messages, vco-inspector), VCO helpers and in-memory transport in `lib/`. All features are React Context + custom hooks; no global store. Every message is a real signed VCO envelope validated on receipt.

**Tech Stack:** Tauri 2, React 19, TypeScript, Tailwind CSS 4, Vite 7, lucide-react, `@vco/vco-core`, `@vco/vco-crypto`

---

### Task 1: Package scaffold — config files

**Files:**
- Create: `packages/vco-cord/package.json`
- Create: `packages/vco-cord/index.html`
- Create: `packages/vco-cord/vite.config.ts`
- Create: `packages/vco-cord/tsconfig.json`
- Create: `packages/vco-cord/tsconfig.node.json`
- Create: `packages/vco-cord/postcss.config.js`
- Create: `packages/vco-cord/tailwind.config.js`
- Modify: `package.json` (root) — add `packages/vco-cord` to workspaces

**Step 1: Create `packages/vco-cord/package.json`**

```json
{
  "name": "@vco/vco-cord",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vco/vco-core": "0.1.0",
    "@vco/vco-crypto": "0.1.0",
    "lucide-react": "^0.575.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
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

**Step 2: Create `packages/vco-cord/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VCO Cord</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 3: Create `packages/vco-cord/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 1421, strictPort: false },
});
```

**Step 4: Create `packages/vco-cord/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 5: Create `packages/vco-cord/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 6: Create `packages/vco-cord/postcss.config.js`**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
```

**Step 7: Create `packages/vco-cord/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

**Step 8: Add `packages/vco-cord` to root workspace**

In root `package.json`, add `"packages/vco-cord"` to the `"workspaces"` array.

**Step 9: Install deps**

```bash
npm install
```

Expected: No errors. `packages/vco-cord/node_modules` created.

**Step 10: Commit**

```bash
git add packages/vco-cord/package.json packages/vco-cord/index.html packages/vco-cord/vite.config.ts packages/vco-cord/tsconfig.json packages/vco-cord/tsconfig.node.json packages/vco-cord/postcss.config.js packages/vco-cord/tailwind.config.js package.json package-lock.json
git commit -m "feat(vco-cord): scaffold package with Vite + React + Tailwind config"
```

---

### Task 2: Shared types

**Files:**
- Create: `packages/vco-cord/src/types/index.ts`

**Step 1: Create types**

```typescript
// packages/vco-cord/src/types/index.ts

export interface Identity {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  creatorId: Uint8Array;
  displayName: string;
}

export interface VcoMessage {
  id: string;               // headerHash hex
  channelId: string;
  authorId: string;         // creatorId hex
  authorName: string;
  content: string;
  timestamp: number;
  powScore: number;
  flags: number;
  rawEnvelope: Uint8Array;  // full encoded envelope for inspector
  verified: boolean;        // validateEnvelope passed
  tampered: boolean;        // validateEnvelope threw
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  serverId: string;
}

export interface Server {
  id: string;
  name: string;
  acronym: string;
  color: string;            // tailwind bg class e.g. "bg-indigo-600"
  channels: Channel[];
}
```

**Step 2: Typecheck**

```bash
cd packages/vco-cord && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors (or only "cannot find module react" until main.tsx exists).

**Step 3: Commit**

```bash
git add packages/vco-cord/src/types/index.ts
git commit -m "feat(vco-cord): add shared domain types"
```

---

### Task 3: In-memory transport (`lib/transport.ts`)

**Files:**
- Create: `packages/vco-cord/src/lib/transport.ts`

**Step 1: Write transport**

```typescript
// packages/vco-cord/src/lib/transport.ts
// Simulates a libp2p pub/sub channel with an in-process EventEmitter.
// Subscribers receive the same Uint8Array that was published —
// identical to what real VCO sync would send over the wire.

type Listener = (encoded: Uint8Array) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribe(channelId: string, fn: Listener): () => void {
  if (!listeners.has(channelId)) listeners.set(channelId, new Set());
  listeners.get(channelId)!.add(fn);
  return () => listeners.get(channelId)?.delete(fn);
}

export function publish(channelId: string, encoded: Uint8Array): void {
  listeners.get(channelId)?.forEach((fn) => fn(encoded));
}
```

**Step 2: Commit**

```bash
git add packages/vco-cord/src/lib/transport.ts
git commit -m "feat(vco-cord): add in-memory pub/sub transport"
```

---

### Task 4: VCO crypto helpers (`lib/vco.ts`)

**Files:**
- Create: `packages/vco-cord/src/lib/vco.ts`

**Step 1: Write helpers**

```typescript
// packages/vco-cord/src/lib/vco.ts

import {
  createEnvelope,
  encodeEnvelopeProto,
  decodeEnvelopeProto,
  validateEnvelope,
  getPowScore,
  solvePoWNonce,
  VCO_VERSION,
  MULTICODEC_PROTOBUF,
} from "@vco/vco-core";
import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
  deriveEd25519PublicKey,
} from "@vco/vco-crypto";
import type { Identity, VcoMessage } from "../types/index.js";

const crypto = createNobleCryptoProvider();

export function generateIdentity(displayName: string): Identity {
  const privateKey = crypto.randomBytes(32);
  const publicKey = deriveEd25519PublicKey(privateKey);
  const creatorId = deriveEd25519Multikey(privateKey);
  return { privateKey, publicKey, creatorId, displayName };
}

export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const POW_DIFFICULTY = 4;

export async function buildMessage(
  channelId: string,
  content: string,
  identity: Identity,
): Promise<VcoMessage> {
  const payload = new TextEncoder().encode(content);
  const nonce = await solvePoWNonce(
    { payload, payloadType: MULTICODEC_PROTOBUF, creatorId: identity.creatorId },
    POW_DIFFICULTY,
    crypto,
  );
  const envelope = createEnvelope(
    {
      payload,
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: identity.creatorId,
      privateKey: identity.privateKey,
      powNonce: nonce,
    },
    crypto,
  );
  const rawEnvelope = encodeEnvelopeProto(envelope);
  const powScore = getPowScore(envelope.headerHash);
  return {
    id: uint8ArrayToHex(envelope.headerHash),
    channelId,
    authorId: uint8ArrayToHex(identity.creatorId),
    authorName: identity.displayName,
    content,
    timestamp: Date.now(),
    powScore,
    flags: envelope.flags,
    rawEnvelope,
    verified: true,
    tampered: false,
  };
}

export function decodeMessage(
  channelId: string,
  encoded: Uint8Array,
  knownAuthors: Map<string, string>,
): VcoMessage {
  const envelope = decodeEnvelopeProto(encoded);
  let verified = false;
  let tampered = false;
  try {
    validateEnvelope(envelope, crypto);
    verified = true;
  } catch {
    tampered = true;
  }
  const authorId = uint8ArrayToHex(envelope.creatorId);
  return {
    id: uint8ArrayToHex(envelope.headerHash),
    channelId,
    authorId,
    authorName: knownAuthors.get(authorId) ?? authorId.slice(0, 8) + "…",
    content: new TextDecoder().decode(envelope.payload),
    timestamp: Date.now(),
    powScore: getPowScore(envelope.headerHash),
    flags: envelope.flags,
    rawEnvelope: encoded,
    verified,
    tampered,
  };
}
```

**Step 2: Commit**

```bash
git add packages/vco-cord/src/lib/vco.ts
git commit -m "feat(vco-cord): add VCO crypto helpers (sign, PoW, decode, validate)"
```

---

### Task 5: UI primitives (`components/ui/`)

**Files:**
- Create: `packages/vco-cord/src/components/ui/Avatar.tsx`
- Create: `packages/vco-cord/src/components/ui/Badge.tsx`
- Create: `packages/vco-cord/src/components/ui/Tooltip.tsx`

**Step 1: Create `Avatar.tsx`**

```tsx
// packages/vco-cord/src/components/ui/Avatar.tsx
import { clsx } from "clsx";

interface Props {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base" };

export function Avatar({ name, color = "bg-indigo-600", size = "md" }: Props) {
  return (
    <div className={clsx("rounded-full flex items-center justify-center font-bold text-white select-none", color, sizes[size])}>
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
```

**Step 2: Create `Badge.tsx`**

```tsx
// packages/vco-cord/src/components/ui/Badge.tsx
import { clsx } from "clsx";

interface Props {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning";
}

const variants = {
  default: "bg-zinc-700 text-zinc-300",
  success: "bg-emerald-800 text-emerald-300",
  danger: "bg-red-800 text-red-300",
  warning: "bg-yellow-800 text-yellow-300",
};

export function Badge({ children, variant = "default" }: Props) {
  return (
    <span className={clsx("px-1.5 py-0.5 rounded text-xs font-mono", variants[variant])}>
      {children}
    </span>
  );
}
```

**Step 3: Create `Tooltip.tsx`**

```tsx
// packages/vco-cord/src/components/ui/Tooltip.tsx
interface Props {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: Props) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {text}
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add packages/vco-cord/src/components/
git commit -m "feat(vco-cord): add Avatar, Badge, Tooltip UI primitives"
```

---

### Task 6: Identity feature

**Files:**
- Create: `packages/vco-cord/src/features/identity/IdentityContext.tsx`

**Step 1: Write IdentityContext**

```tsx
// packages/vco-cord/src/features/identity/IdentityContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { generateIdentity, uint8ArrayToHex } from "../../lib/vco.js";
import type { Identity } from "../../types/index.js";

interface IdentityCtx {
  identity: Identity | null;
  regenerate: () => void;
}

const Ctx = createContext<IdentityCtx | undefined>(undefined);

const NAMES = ["Alice", "Bob", "Carol", "Dave", "Eve", "Faythe", "Grace"];

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);

  const regenerate = () => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)]!;
    setIdentity(generateIdentity(name));
  };

  useEffect(() => { regenerate(); }, []);

  return <Ctx.Provider value={{ identity, regenerate }}>{children}</Ctx.Provider>;
}

export function useIdentity(): IdentityCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdentity requires IdentityProvider");
  return ctx;
}
```

**Step 2: Commit**

```bash
git add packages/vco-cord/src/features/identity/
git commit -m "feat(vco-cord): add IdentityProvider and useIdentity hook"
```

---

### Task 7: Servers feature

**Files:**
- Create: `packages/vco-cord/src/features/servers/ServerContext.tsx`
- Create: `packages/vco-cord/src/features/servers/ServerList.tsx`

**Step 1: Create `ServerContext.tsx`**

```tsx
// packages/vco-cord/src/features/servers/ServerContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Server, Channel } from "../../types/index.js";

const SEED_SERVERS: Server[] = [
  {
    id: "vco-general",
    name: "VCO Protocol",
    acronym: "VCO",
    color: "bg-indigo-600",
    channels: [
      { id: "vco-general-general", name: "general", description: "General VCO discussion", serverId: "vco-general" },
      { id: "vco-general-dev", name: "dev", description: "Protocol development", serverId: "vco-general" },
      { id: "vco-general-pow", name: "pow-showcase", description: "Proof-of-Work demos", serverId: "vco-general" },
    ],
  },
  {
    id: "crypto-guild",
    name: "Crypto Guild",
    acronym: "CG",
    color: "bg-emerald-600",
    channels: [
      { id: "crypto-guild-lobby", name: "lobby", description: "Welcome channel", serverId: "crypto-guild" },
      { id: "crypto-guild-zkp", name: "zkp-lab", description: "Zero-knowledge proofs", serverId: "crypto-guild" },
    ],
  },
];

interface ServerCtx {
  servers: Server[];
  activeServer: Server;
  activeChannel: Channel;
  setActiveServer: (id: string) => void;
  setActiveChannel: (id: string) => void;
}

const Ctx = createContext<ServerCtx | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [activeServerId, setActiveServerId] = useState(SEED_SERVERS[0]!.id);
  const [activeChannelId, setActiveChannelId] = useState(SEED_SERVERS[0]!.channels[0]!.id);

  const activeServer = SEED_SERVERS.find((s) => s.id === activeServerId) ?? SEED_SERVERS[0]!;
  const allChannels = SEED_SERVERS.flatMap((s) => s.channels);
  const activeChannel = allChannels.find((c) => c.id === activeChannelId) ?? activeServer.channels[0]!;

  const setActiveServer = (id: string) => {
    const server = SEED_SERVERS.find((s) => s.id === id);
    if (server) {
      setActiveServerId(id);
      setActiveChannelId(server.channels[0]!.id);
    }
  };

  return (
    <Ctx.Provider value={{ servers: SEED_SERVERS, activeServer, activeChannel, setActiveServer, setActiveChannel: setActiveChannelId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useServers(): ServerCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useServers requires ServerProvider");
  return ctx;
}
```

**Step 2: Create `ServerList.tsx`**

```tsx
// packages/vco-cord/src/features/servers/ServerList.tsx
import { useServers } from "./ServerContext.js";
import { clsx } from "clsx";
import { Tooltip } from "../../components/ui/Tooltip.js";

export function ServerList() {
  const { servers, activeServer, setActiveServer } = useServers();
  return (
    <div className="w-16 bg-zinc-950 flex flex-col items-center py-3 gap-2 shrink-0">
      {servers.map((s) => (
        <Tooltip key={s.id} text={s.name}>
          <button
            onClick={() => setActiveServer(s.id)}
            className={clsx(
              "w-12 h-12 rounded-2xl font-bold text-white text-sm transition-all",
              s.color,
              activeServer.id === s.id ? "rounded-xl" : "hover:rounded-xl opacity-80 hover:opacity-100",
            )}
          >
            {s.acronym}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add packages/vco-cord/src/features/servers/
git commit -m "feat(vco-cord): add ServerProvider with seed data and ServerList sidebar"
```

---

### Task 8: Channels feature

**Files:**
- Create: `packages/vco-cord/src/features/channels/ChannelList.tsx`

**Step 1: Create `ChannelList.tsx`**

```tsx
// packages/vco-cord/src/features/channels/ChannelList.tsx
import { Hash } from "lucide-react";
import { useServers } from "../servers/ServerContext.js";
import { useIdentity } from "../identity/IdentityContext.js";
import { clsx } from "clsx";
import { Avatar } from "../../components/ui/Avatar.js";
import { uint8ArrayToHex } from "../../lib/vco.js";

export function ChannelList() {
  const { activeServer, activeChannel, setActiveChannel } = useServers();
  const { identity, regenerate } = useIdentity();

  return (
    <div className="w-56 bg-zinc-800 flex flex-col shrink-0">
      {/* Server header */}
      <div className="px-4 py-3 border-b border-zinc-700 font-semibold text-white truncate">
        {activeServer.name}
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-2">Channels</span>
        </div>
        {activeServer.channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={clsx(
              "w-full flex items-center gap-1.5 px-3 py-1.5 rounded mx-1 text-sm transition-colors",
              activeChannel.id === ch.id
                ? "bg-zinc-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700",
            )}
          >
            <Hash size={14} className="shrink-0" />
            {ch.name}
          </button>
        ))}
      </div>

      {/* Identity footer */}
      {identity && (
        <div className="p-2 bg-zinc-900 flex items-center gap-2">
          <Avatar name={identity.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{identity.displayName}</div>
            <div className="text-xs text-zinc-500 truncate font-mono">
              {uint8ArrayToHex(identity.creatorId).slice(0, 10)}…
            </div>
          </div>
          <button onClick={regenerate} className="text-zinc-500 hover:text-zinc-300 text-xs" title="New identity">⟳</button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add packages/vco-cord/src/features/channels/
git commit -m "feat(vco-cord): add ChannelList with identity footer"
```

---

### Task 9: Messages feature

**Files:**
- Create: `packages/vco-cord/src/features/messages/useMessages.ts`
- Create: `packages/vco-cord/src/features/messages/MessageList.tsx`
- Create: `packages/vco-cord/src/features/messages/MessageInput.tsx`

**Step 1: Create `useMessages.ts`**

```typescript
// packages/vco-cord/src/features/messages/useMessages.ts
import { useState, useEffect, useCallback } from "react";
import { subscribe, publish } from "../../lib/transport.js";
import { buildMessage, decodeMessage, uint8ArrayToHex } from "../../lib/vco.js";
import type { VcoMessage, Identity } from "../../types/index.js";

export function useMessages(channelId: string, identity: Identity | null) {
  const [messages, setMessages] = useState<VcoMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [knownAuthors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setMessages([]);
    const unsub = subscribe(channelId, (encoded) => {
      const msg = decodeMessage(channelId, encoded, knownAuthors);
      setMessages((prev) => [...prev, msg]);
    });
    return unsub;
  }, [channelId]);

  const send = useCallback(async (content: string) => {
    if (!identity || !content.trim()) return;
    setSending(true);
    try {
      knownAuthors.set(uint8ArrayToHex(identity.creatorId), identity.displayName);
      const msg = await buildMessage(channelId, content, identity);
      publish(channelId, msg.rawEnvelope);
    } finally {
      setSending(false);
    }
  }, [channelId, identity]);

  return { messages, send, sending };
}
```

**Step 2: Create `MessageList.tsx`**

```tsx
// packages/vco-cord/src/features/messages/MessageList.tsx
import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Avatar } from "../../components/ui/Avatar.js";
import { Badge } from "../../components/ui/Badge.js";
import { Tooltip } from "../../components/ui/Tooltip.js";
import { ShieldCheck, ShieldX, Zap } from "lucide-react";
import type { VcoMessage } from "../../types/index.js";

interface Props {
  messages: VcoMessage[];
  onSelectMessage: (msg: VcoMessage) => void;
  selectedMessageId: string | null;
}

export function MessageList({ messages, onSelectMessage, selectedMessageId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        No messages yet. Send one to see VCO envelopes in action.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
      {messages.map((msg) => (
        <div
          key={msg.id}
          onClick={() => onSelectMessage(msg)}
          className={clsx(
            "flex gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
            selectedMessageId === msg.id ? "bg-zinc-700" : "hover:bg-zinc-800",
          )}
        >
          <Avatar name={msg.authorName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-white text-sm">{msg.authorName}</span>
              <span className="text-zinc-500 text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              <Tooltip text={msg.tampered ? "Signature invalid" : "Signature verified"}>
                {msg.tampered
                  ? <ShieldX size={12} className="text-red-400" />
                  : <ShieldCheck size={12} className="text-emerald-400" />}
              </Tooltip>
              <Tooltip text={`PoW score: ${msg.powScore}`}>
                <span className="flex items-center gap-0.5 text-yellow-500 text-xs">
                  <Zap size={10} />{msg.powScore}
                </span>
              </Tooltip>
              {msg.tampered && <Badge variant="danger">TAMPERED</Badge>}
            </div>
            <p className="text-zinc-200 text-sm break-words">{msg.content}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
```

**Step 3: Create `MessageInput.tsx`**

```tsx
// packages/vco-cord/src/features/messages/MessageInput.tsx
import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface Props {
  channelName: string;
  onSend: (content: string) => Promise<void>;
  disabled: boolean;
}

export function MessageInput({ channelName, onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSend = async () => {
    if (!value.trim() || disabled) return;
    const content = value;
    setValue("");
    await onSend(content);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 bg-zinc-700 rounded-lg px-4 py-2">
        <input
          className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-500 text-sm outline-none"
          placeholder={disabled ? "Solving PoW…" : `Message #${channelName}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={() => void handleSend()}
          disabled={disabled || !value.trim()}
          className="text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-zinc-600 text-xs mt-1 px-1">Every message is a signed VCO envelope with PoW difficulty 4</p>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add packages/vco-cord/src/features/messages/
git commit -m "feat(vco-cord): add useMessages hook, MessageList, and MessageInput"
```

---

### Task 10: VCO Inspector feature

**Files:**
- Create: `packages/vco-cord/src/features/vco-inspector/VcoInspector.tsx`

**Step 1: Create `VcoInspector.tsx`**

```tsx
// packages/vco-cord/src/features/vco-inspector/VcoInspector.tsx
import { decodeEnvelopeProto, getPowScore } from "@vco/vco-core";
import { ShieldCheck, ShieldX, Zap, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge.js";
import type { VcoMessage } from "../../types/index.js";

interface Props {
  message: VcoMessage | null;
  onClose: () => void;
}

function hex(arr: Uint8Array) {
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function row(label: string, value: string, mono = true) {
  return (
    <div key={label} className="py-1.5 border-b border-zinc-700 last:border-0">
      <div className="text-zinc-500 text-xs mb-0.5">{label}</div>
      <div className={mono ? "font-mono text-xs text-zinc-300 break-all" : "text-sm text-zinc-200"}>
        {value}
      </div>
    </div>
  );
}

export function VcoInspector({ message, onClose }: Props) {
  if (!message) {
    return (
      <div className="w-80 bg-zinc-900 border-l border-zinc-700 flex items-center justify-center text-zinc-600 text-sm shrink-0">
        Click a message to inspect its VCO envelope
      </div>
    );
  }

  const envelope = decodeEnvelopeProto(message.rawEnvelope);

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-700 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <span className="font-semibold text-white text-sm">VCO Inspector</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={14} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex gap-2 mb-3">
          {message.verified
            ? <Badge variant="success"><ShieldCheck size={10} className="inline mr-1" />Verified</Badge>
            : <Badge variant="danger"><ShieldX size={10} className="inline mr-1" />Invalid</Badge>}
          <Badge variant="warning"><Zap size={10} className="inline mr-1" />PoW {message.powScore}</Badge>
        </div>

        {row("Header Hash", hex(envelope.headerHash))}
        {row("Creator ID", hex(envelope.creatorId))}
        {row("Signature", hex(envelope.signature))}
        {row("Version", String(envelope.version), false)}
        {row("Flags", `0x${envelope.flags.toString(16).padStart(2, "0")} (${envelope.flags.toString(2).padStart(8, "0")})`)}
        {row("PoW Nonce", String(envelope.powNonce), false)}
        {row("PoW Score", String(getPowScore(envelope.headerHash)), false)}
        {row("Payload Type", `0x${envelope.payloadType.toString(16)}`)}
        {row("Payload (UTF-8)", new TextDecoder().decode(envelope.payload), false)}
        {row("Raw bytes", message.rawEnvelope.length + " bytes", false)}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add packages/vco-cord/src/features/vco-inspector/
git commit -m "feat(vco-cord): add VcoInspector panel for envelope details"
```

---

### Task 11: App entry point and root layout

**Files:**
- Create: `packages/vco-cord/src/index.css`
- Create: `packages/vco-cord/src/main.tsx`
- Create: `packages/vco-cord/src/App.tsx`

**Step 1: Create `index.css`**

```css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #18181b;
  color: #e4e4e7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#root {
  height: 100vh;
  display: flex;
  overflow: hidden;
}
```

**Step 2: Create `main.tsx`**

```tsx
// packages/vco-cord/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

**Step 3: Create `App.tsx`**

```tsx
// packages/vco-cord/src/App.tsx
import { useState } from "react";
import { IdentityProvider, useIdentity } from "./features/identity/IdentityContext.js";
import { ServerProvider, useServers } from "./features/servers/ServerContext.js";
import { ServerList } from "./features/servers/ServerList.js";
import { ChannelList } from "./features/channels/ChannelList.js";
import { MessageList } from "./features/messages/MessageList.js";
import { MessageInput } from "./features/messages/MessageInput.js";
import { VcoInspector } from "./features/vco-inspector/VcoInspector.js";
import { useMessages } from "./features/messages/useMessages.js";
import type { VcoMessage } from "./types/index.js";

function MessageArea() {
  const { activeChannel } = useServers();
  const { identity } = useIdentity();
  const { messages, send, sending } = useMessages(activeChannel.id, identity);
  const [selectedMessage, setSelectedMessage] = useState<VcoMessage | null>(null);

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-750">
        {/* Channel header */}
        <div className="px-4 py-3 border-b border-zinc-700 flex items-center gap-2">
          <span className="text-zinc-400">#</span>
          <span className="font-semibold text-white">{activeChannel.name}</span>
          <span className="text-zinc-500 text-sm">— {activeChannel.description}</span>
        </div>
        <MessageList
          messages={messages}
          onSelectMessage={setSelectedMessage}
          selectedMessageId={selectedMessage?.id ?? null}
        />
        <MessageInput
          channelName={activeChannel.name}
          onSend={send}
          disabled={!identity || sending}
        />
      </div>
      <VcoInspector
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </>
  );
}

function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ServerList />
      <ChannelList />
      <MessageArea />
    </div>
  );
}

export function App() {
  return (
    <IdentityProvider>
      <ServerProvider>
        <Layout />
      </ServerProvider>
    </IdentityProvider>
  );
}
```

**Step 4: Typecheck**

```bash
cd packages/vco-cord && npx tsc --noEmit 2>&1 | head -40
```

Fix any type errors before proceeding.

**Step 5: Commit**

```bash
git add packages/vco-cord/src/
git commit -m "feat(vco-cord): wire up root App layout with all feature modules"
```

---

### Task 12: Verify dev server runs

**Step 1: Run dev server**

```bash
cd packages/vco-cord && npm run dev
```

Expected: Vite starts on port 1421, no console errors. Open `http://localhost:1421` in browser.

**Step 2: Smoke test**
- Server list visible on the left (VCO Protocol, Crypto Guild)
- Channel list shows #general, #dev, #pow-showcase
- Identity footer shows a name + truncated creatorId hex
- Type a message and press Enter — message appears with ✓ shield and PoW score
- Click a message — VCO Inspector panel opens showing envelope fields

**Step 3: Commit (if any fixes needed)**

```bash
git add -A && git commit -m "fix(vco-cord): dev server smoke test fixes"
```

---

### Task 13: Push branch

```bash
git push -u origin feature/discord-showcase
```
