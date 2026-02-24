# VCO

Verifiable Content Object (VCO) Protocol v3.2 with a modular, reusable, library-first workspace.

## Protocol Schema

- Canonical Protobuf schema: `proto/vco/v3/vco.proto`
- Generated TS runtime/types: `packages/vco-core/src/generated/vco.pb.js` and `packages/vco-core/src/generated/vco.pb.d.ts`
- Envelope and sync serialization use Protobuf (no manual byte-slicing).
- ZKP-auth support is schema-native via `Envelope.zkp_extension` and `FLAGS.ZKP_AUTH`.
- PoW support is schema-native via `Envelope.nonce` and `FLAGS.POW_ACTIVE`.

## ZKP Extension Model

- `@vco/vco-core` provides a verifier registry interface (`IZKPVerifier`) and `VCOCore` validation flow.
- The library does not embed zk-SNARK/STARK math; applications register circuit-specific verifiers.
- Nullifier replay prevention is enforced at library level during ZKP-auth envelope validation.

## PoW Extension Model

- `@vco/vco-core` exposes `verifyPoW`, `countLeadingZeroBits`, `getPowScore`, and `solvePoWNonce`.
- `createEnvelope()` supports `powDifficulty` and deterministic `nonce` solving.
- `VCOCore.validateEnvelope()` supports receiver-side minimum PoW enforcement for backpressure/rate-limiting policies.

## Workspace Packages

- `packages/vco-crypto`
- `packages/vco-core`
- `packages/vco-sync`
- `packages/vco-transport`

## Development

```bash
npm install
npm run proto:gen
npm run multicodec:gen
npm run typecheck
npm run test
npm run build
```
