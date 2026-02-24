# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # install workspace deps (required first)
npm run proto:gen              # regenerate protobuf bindings from proto/vco/v3/vco.proto
npm run multicodec:gen         # regenerate multicodec registry
npm run typecheck              # tsc --noEmit across all workspaces
npm run test                   # run vitest suites across all workspaces
npm run build                  # proto:gen + build all packages into dist/
npm run clean                  # remove dist/, .tsbuildinfo, and generated protobuf stubs
```

Run tests for a single package (from repo root):
```bash
npm run test --workspace=packages/vco-core
npm run test --workspace=packages/vco-sync
```

**Always run `npm run proto:gen` before typechecking or testing if `proto/vco/v3/vco.proto` has changed.**

## Architecture

This is a TypeScript npm workspace implementing the VCO (Verifiable Content Object) protocol v3.2 — a Layer 3.5 P2P content protocol with envelope integrity, ZKP-agnostic auth, PoW rate-limiting, and range-based sync.

### Package Dependency Order

```
vco-crypto  →  vco-core  →  vco-sync
                         →  vco-transport
```

- **`@vco/vco-crypto`** (`packages/vco-crypto/`): Thin wrappers around `@noble/curves` (Ed25519) and `@noble/hashes` (BLAKE3). All crypto adapters live here; no raw crypto elsewhere.

- **`@vco/vco-core`** (`packages/vco-core/`): Envelope creation/validation, PoW solve/verify, ZKP verifier registry interface, Multihash/Multikey encoding, protobuf serialization helpers, fragmentation. This is the canonical protocol library — `validation.ts` is the primary validation entry point, `envelope.ts` for creation.

- **`@vco/vco-sync`** (`packages/vco-sync/`): Range-based set reconciliation engine using `@nostr-dev-kit/sync` (Negentropy), fingerprinting via `merkle-ts`, PoW admission policy (`pow-policy.ts`), envelope receiver with backpressure (`envelope-receiver.ts`), libp2p stream handler, and sync orchestrator.

- **`@vco/vco-transport`** (`packages/vco-transport/`): Transport/session abstraction (TOL — Transport Obfuscation Layer). libp2p adapters for QUIC + Noise (`Noise_XX_25519_ChaChaPoly_SHA256`) + Yamux mux. Frame/packet serialization in `frame.ts`/`packetizer.ts`.

### Protobuf Code Generation

- Schema: `proto/vco/v3/vco.proto` — canonical wire format for `Envelope`, `ZKPExtension`, `PowChallenge`, `SyncControl`, `SyncMessage`.
- Generator: `scripts/generate-proto.mjs` → outputs to `packages/*/src/generated/vco.pb.js` + `vco.pb.d.ts`.
- Manual byte-slicing of envelope/sync wire format is non-compliant; always use generated protobuf code.

### Key Protocol Concepts

- **Envelope flags** (`VCOFlags`): `EPHEMERAL` (bit 7), `OBFUSCATED` (bit 6), `POW_ACTIVE` (bit 5), `ZKP_AUTH` (bit 4). Bits 0–3 reserved/zero.
- **PoW**: Leading-zero-bit threshold on `header_hash`. Nonce is uint32. `verifyPoW` / `solvePoWNonce` in `vco-core`. Receiver backpressure via `PowChallenge` protobuf messages.
- **ZKP**: Library carries `zkp_extension`, routes by `circuit_id` via app-registered `IZKPVerifier`, enforces nullifier replay. App supplies proof generation and circuit verifiers.
- **Sync state machine**: INIT → COMPARE → BISECT → RECURSE → EXCHANGE. `RECON_THRESHOLD=16` governs list-exchange vs bisect.
- **Constants**: `MAX_VCO_SIZE=4194304`, `RECON_THRESHOLD=16`, `IDLE_TIMEOUT=300s`, `MAGIC_BYTES=0x56434F03`.

### Adding New Wire Messages

1. Update `proto/vco/v3/vco.proto`.
2. Run `npm run proto:gen`.
3. Verify `packages/*/src/generated/` is synced.
4. Add binary encode/decode tests before other tests.

### ADR Requirement

Any deviation from the canonical libraries (`protobufjs`, `multiformats`, `libp2p`, `@chainsafe` stacks, `@noble/hashes`, `@noble/curves`) requires an ADR in `docs/adr/`.

## Testing Conventions

Test files are named after behavior: `envelope-roundtrip.test.ts`, `sync-bisect-threshold.test.ts`, etc. Use deterministic fixtures for protocol-critical logic. Each behavioral change must include binary encode/decode tests, crypto validation failure paths, and state-machine transition tests.
