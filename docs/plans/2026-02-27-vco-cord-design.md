# vco-cord Design

**Date:** 2026-02-27  
**Branch:** feature/discord-showcase  
**Package:** `packages/vco-cord/`

## Summary

A Discord-style desktop app (`vco-cord`) built with Tauri + React that showcases the VCO protocol. Messages are real VCO envelopes — signed with Ed25519, PoW-solved, tamper-evident — transported over an in-memory bus that mirrors the libp2p path without requiring real networking.

## Package Structure

New standalone Tauri + React app at `packages/vco-cord/`. Hybrid module layout:

```
packages/vco-cord/src/
├── main.tsx
├── App.tsx                     # root layout only (~50 lines)
├── components/
│   └── ui/                     # primitives: Avatar, Badge, Button, Tooltip
├── features/
│   ├── identity/               # keygen, IdentityProvider, useIdentity hook
│   ├── servers/                # Server list sidebar, ServerProvider
│   ├── channels/               # Channel list, ChannelProvider
│   ├── messages/               # MessageList, MessageInput, useMessages hook
│   └── vco-inspector/          # Envelope details panel (the showcase element)
├── lib/
│   ├── vco.ts                  # VCO crypto helpers (sign, verify, PoW solve)
│   └── transport.ts            # In-memory EventEmitter bus
└── types/
    └── index.ts                # shared domain types
```

## UI Layout

Discord 3-column layout:

```
┌──────┬────────────────────┬──────────────────────────┐
│Server│  Channel List      │  Message Area            │
│ List │  (left sidebar)    │  + VCO Inspector Panel   │
│ 64px │      220px         │    flex-1    │   320px   │
└──────┴────────────────────┴──────────────────────────┘
```

## VCO Integration

Every message is a real VCO envelope:
- Signed with Ed25519 via `vco-crypto`
- PoW solved at difficulty 4 (score shown on hover)
- Tamper-evident: tampered/replayed envelopes show ❌ badge
- VCO Inspector panel shows: `headerHash`, `creatorId`, `flags`, `powScore`, payload bytes

## Data Flow

`send(text)` → solve PoW → `createEnvelope` → `encodeEnvelopeProto` → in-memory bus → `decodeEnvelopeProto` → `validateEnvelope` → append to message list

State is managed via React Context + custom hooks per feature. No global store.

## State Ownership

| Provider/Hook | Owns |
|---|---|
| `IdentityProvider` | Ed25519 keypair |
| `ServerProvider` | Server + channel list (seed data) |
| `useMessages(channelId)` | Message list per channel, send action |
| `useVcoInspector` | Selected envelope for inspection |

## Error Handling

- Invalid signatures → red tamper badge on message
- PoW failures → surfaced in inspector panel
- No silent failures

## Tech Stack

Mirrors `vco-desktop`: Tauri 2, React 19, TypeScript, Tailwind CSS 4, Vite, lucide-react.  
VCO packages: `@vco/vco-core`, `@vco/vco-crypto`.
