# VCO Library Architecture

The reusable VCO library is split into modular packages with explicit responsibility boundaries:

- `@vco/vco-crypto`: crypto provider interfaces and third-party library adapters.
- `@vco/vco-core`: VCO envelope domain model, constants, validation, fragmentation, Protobuf codecs, ZKP-auth verifier registry/replay guard interfaces, and PoW helpers (`nonce` + difficulty verification/solve APIs).
- `@vco/vco-sync`: reconciliation orchestration with a thin adapter over `@nostr-dev-kit/sync` (`Negentropy`/`NegentropyStorage`), schema-backed sync wire helpers, a channel-agnostic range-proof protocol wrapper, a Merkle-based range fingerprint builder, and a multi-round sync exchange orchestrator.
- `@vco/vco-transport`: transport framing/packetization, TOL session lifecycle (idle timeout), plus a thin libp2p adapter over `libp2p` + `@chainsafe/libp2p-noise` + `@chainsafe/libp2p-quic` + `@chainsafe/libp2p-yamux`.
  - Active library profile: `Noise_XX_25519_ChaChaPoly_SHA256` (see `docs/adr/0002-transport-noise-profile-exception.md`).
  - Includes `Libp2pSessionChannel` for stream-based byte message exchange via `TransportSession`.
  - Includes sync-channel helpers (`openSyncSessionChannel`, `handleSyncSessionChannels`) around protocol `/vco/sync/3.2.0`.
  - Includes live integration coverage for two-node QUIC sync channel exchange.

## Serialization Contract

- Canonical schema: `proto/vco/v3/vco.proto`.
- Generated protobuf modules:
  - `packages/vco-core/src/generated/vco.pb.js` + `packages/vco-core/src/generated/vco.pb.d.ts`
  - `packages/vco-sync/src/generated/vco.pb.js` + `packages/vco-sync/src/generated/vco.pb.d.ts`
  (`npm run proto:gen`)
- Envelope and sync messages must be encoded/decoded via Protobuf.
- Manual byte-slicing for VCO wire format is non-compliant.
- `Envelope.zkp_extension` is the v3.x blind slot for app-defined ZKP proofs/verifier inputs.
- `FLAGS.ZKP_AUTH` switches auth mode from signature-auth to verifier-registry auth.
- `Envelope.nonce` and `FLAGS.POW_ACTIVE` support v3.2 PoW-based backpressure/priority checks.
- Sync traffic is multiplexed through `SyncControl` (`sync_message` or `pow_challenge`) to allow policy signaling without ad-hoc side channels.

## Dependency Direction

- `vco-crypto` has no internal package dependencies.
- `vco-core` depends on `vco-crypto` abstractions only.
- `vco-sync` and `vco-transport` depend on `vco-core` contracts.
- ZKP proof engines (for example `snarkjs`/Semaphore verifiers) remain application dependencies; core exposes interfaces only.

No package may import application/UI concerns.
