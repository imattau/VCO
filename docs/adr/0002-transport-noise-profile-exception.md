# ADR 0002: Transport Noise Profile Exception (Library-First)

## Status
Accepted

## Context
`SPEC.md` currently states a TOL target of `Noise_IK_25519_ChaChaPoly_BLAKE3`.
The maintained JS implementation used by this repository (`@chainsafe/libp2p-noise`) provides the profile `Noise_XX_25519_ChaChaPoly_SHA256`.

Per repository policy, transport protocol internals should use established libraries rather than custom cryptographic handshakes.

## Decision
- Use `libp2p` + `@chainsafe/libp2p-noise` as the default VCO transport security stack.
- Treat `Noise_XX_25519_ChaChaPoly_SHA256` as the active implementation profile for `vco-transport`.
- Keep the transport adapter boundary in `packages/vco-transport/src/libp2p.ts` so profile replacement is isolated if/when a maintained IK+BLAKE3 implementation is available.
- Make the active profile explicit in code via `VCO_LIBP2P_NOISE_PROFILE`.

## Consequences
- Immediate benefit: strong, maintained, and interoperable transport security without custom handshake code.
- Trade-off: current implementation differs from the strict IK+BLAKE3 wording in spec.
- Mitigation: profile is documented and test-covered; upgrading the profile remains a bounded change at the adapter layer.
