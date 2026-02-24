# Repository Guidelines

## Mandatory Engineering Policy
- Prefer the standard library, then official platform libraries, then mature packages before introducing custom solutions (especially for crypto, transport, serialization, retries, or caching).
- Envelope and sync wire formats must be generated from `proto/vco/v3/vco.proto`; manual byte-slicing or ad-hoc parsing is disallowed unless justified via an ADR in `docs/adr/`.
- Keep modules focused: one responsibility per file, enforce clear boundaries, and avoid monolithic utility files. Files should stay under 400 LOC and functions under 60 LOC when possible.
- Favor modular exports (`packages/vco-core`, `packages/vco-sync`, `packages/vco-transport`, etc.) and ensure public APIs remain narrow. Any exception must live in an ADR (`docs/adr/`).
- Reuse standardized libraries such as `protobufjs`, `multiformats`, `libp2p`, `@chainsafe` transport stacks, `@noble/hashes`, and `@nostr-dev-kit` components rather than rolling bespoke counterparts.

## Project Structure & Module Organization
- Source lives under `packages/<module>/src/` (e.g., `packages/vco-sync/src/`), generated protobuf code under `packages/*/src/generated/`, tests under `packages/<module>/test/`, and docs under `/docs`/ or root `SPEC.md`/`rec_lib.md`.
- Keep transport adapters in `packages/vco-transport`, sync-specific logic in `packages/vco-sync`, and core envelope validation in `packages/vco-core` to preserve modularity. Shared types/utilities stay near the owning package rather than in large shared utility files.

## Build, Test, and Development Commands
- `npm install`: installs workspace dependencies (mandatory before other commands).
- `npm run typecheck`: runs `tsc --noEmit` across workspaces after regenerating protobuf bindings.
- `npm run test`: regenerates protobuf bindings and runs `vitest` suites per package.
- `npm run build`: generates protobuf code then builds each package into `dist/` with emitted artifacts.
- `npm run clean`: removes generated outputs (`dist`, `.tsbuildinfo`, generated protobuf stubs) for a clean slate.

## Coding Style & Naming Conventions
- Mirror protocol constants from `SPEC.md` (`MAX_VCO_SIZE`, `RECON_THRESHOLD`, `VCOFlags`, etc.) with descriptive domain names (e.g., `EnvelopeHeader`, `RangeProof`).
- Use ASCII identifiers only. Stick to camelCase for functions, PascalCase for classes/types, UPPER_SNAKE for constants.
- Keep adapters thin—downstream consumers interact via interfaces, never raw vendor APIs. Split mixed responsibilities immediately.
- Enforce formatting/linting via `tsc` strict checks; keep public APIs documented and exported from `packages/*/src/index.ts`.

## Testing Guidelines
- Each behavioral change must include binary encode/decode tests, cryptographic validation failure paths, sync state-machine transitions, and adapter parity checks.
- Use deterministic fixtures for protocol-critical logic; tests should be named after behavior (`envelope-roundtrip.test.ts`, `sync-bisect-threshold.test.ts`, etc.).
- Run targeted tests when editing a single package before running `npm run test` across workspaces.

## Commit & Pull Request Guidelines
- Commit messages follow the implied imperative style (e.g., `Add sync control framing`, `Revise PoW policy logic`).
- PR descriptions must mention spec sections touched (link to `SPEC.md`), libraries chosen over custom code, validation commands executed, and any ADRs created for deviations.
- Include test results, describe migration/compatibility risks, and list any new dependencies or configuration files.

## Security & Configuration Tips
- Do not ship custom crypto or transport primitives: rely on `@noble/hashes`, `libp2p`, `@chainsafe` stacks, `protobufjs`, and `multiformats`.
- Every borrow of cryptographic code must come from a maintained package and be verified via exported adapters (`packages/vco-crypto`).
- Rate-limiting/backpressure features rely on schema-backed `PowChallenge` messages; keep TTL/difficulty checks in library-level policies (`PowChallengePolicy`).

## Agent-specific Instructions
- Always confirm workspace cleanliness before running builds; rerun `npm run proto:gen` before typechecking or testing if schema changes occur.
- When new functionality requires structured messages, update `proto/vco/v3/vco.proto`, regenerate with `scripts/generate-proto.mjs`, and verify `packages/*/src/generated/` is synced before tests.
