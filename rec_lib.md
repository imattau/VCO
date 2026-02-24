### Recommended Libraries for VCO v3.2

VCO is strict about established libraries:
1. Standard library
2. Official platform library
3. Mature ecosystem package

Do not ship custom crypto primitives, custom protobuf parsers, or custom transport handshakes when maintained libraries exist.

| Component | Preferred Library | Role |
| --- | --- | --- |
| Serialization (required) | `protobufjs` + `protobufjs-cli` (or `buf`) | Canonical envelope/sync codecs from `proto/vco/v3/vco.proto`. |
| Multiformats | `multiformats` | Multikey/Multihash/varint handling. |
| Crypto adapters | `@noble/curves`, `@noble/hashes` | Ed25519 + BLAKE3 baseline implementations. |
| P2P transport | `libp2p` + `@chainsafe/libp2p-quic` + `@chainsafe/libp2p-noise` + `@chainsafe/libp2p-yamux` | Established networking stack for transport adapters. |
| Sync baseline | `@nostr-dev-kit/sync` (`Negentropy`) | Range-based reconciliation baseline. |
| Merkle helpers | `merkle-ts` | Standardized tree/fingerprint support. |
| ZKP app verifier | `snarkjs`, `@semaphore-protocol/*` (circuit dependent) | App-level proof verification plugged into `IZKPVerifier`. |
| Node worker pool for PoW solve | `piscina` | Off-main-thread nonce solving for servers/relays. |
| Browser background PoW | native `Web Worker` API (or `workerize`) | Avoid UI/event-loop blocking during nonce search. |

---

### Required Wire Baseline

- Envelope/sync encode-decode MUST use generated Protobuf code.
- `creator_id` MUST be Multikey.
- `payload_hash` MUST be Multihash.
- `EnvelopeSigningMaterial` and `EnvelopeHeaderHashMaterial` MUST drive deterministic derivation.
- `EnvelopeHeaderHashMaterial.nonce` MUST be included in header-hash computation.
- Sync control frames MUST use `SyncControl` oneof wrappers from the shared schema.
- Manual `Uint8Array` byte slicing for canonical wire parsing is non-compliant.

---

### PoW v3.2 Implementation Guidance

- Use `verifyPoW(headerHash, difficulty)` by leading-zero-bit count (`Math.clz32` fast-path).
- Keep nonce search off the main thread (`piscina`/workers).
- Reuse buffers during nonce iteration to reduce GC pressure.
- Treat PoW difficulty as receiver policy (backpressure), not global consensus.
- Use schema-backed `PowChallenge` control messages instead of ad-hoc JSON challenge payloads.

---

### ZKP-Agnostic Pattern (Unchanged)

Core library:
- carries `zkp_extension`,
- routes verifier calls by `circuit_id`,
- enforces nullifier replay checks.

Application:
- generates proofs,
- registers circuit-specific verifiers,
- chooses proof backend libraries.
