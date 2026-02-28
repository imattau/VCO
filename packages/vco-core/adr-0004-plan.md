# Plan: Implement ADR 0004 - Blind Context Routing and PoW Prioritization

## Objective
Update the VCO protocol to support Blind Context Routing via an optional `context_id` field and formalize PoW-based Quality of Service (QoS) across the stack.

## Strategy
1.  **Schema Evolution**: Update `vco.proto` and regenerate stubs.
2.  **Core Implementation**: Update `@vco/vco-core` to handle the new field in envelope creation, signing, and verification.
3.  **Prioritization Utility**: Ensure `pow_score` is easily accessible for sorting.
4.  **Simulator Update**: Demonstrate blind routing and PoW-based prioritization.

## Tasks

- [x] **Task 1: Update Protobuf Definitions**
    - [x] Add `context_id` to `Envelope`, `EnvelopeSigningMaterial`, and `EnvelopeHeaderHashMaterial` in `proto/vco/v3/vco.proto`.
    - [x] Run `npm run proto:gen`.

- [x] **Task 2: Refactor vco-core for Context ID**
    - [x] Update `VcoHeader` and `Envelope` interfaces in `packages/vco-core/src/types.ts`.
    - [x] Update `createEnvelope` in `packages/vco-core/src/envelope.ts` to include `contextId`.
    - [x] Update `assertEnvelopeIntegrity` and `validateEnvelope` to support and validate the 8-byte `contextId`.
    - [x] Add a utility function `deriveContextId(topic: string): Uint8Array` to `vco-core`.

- [x] **Task 3: Implement Prioritization Support**
    - [x] Add `compareEnvelopesByPoW(a: VcoEnvelope, b: VcoEnvelope): number` utility to `vco-core`.
    - [x] Update JSDoc to reflect PoW priority requirements for compliant relays.

- [x] **Task 4: Update Simulator Proof**
    - [x] Update `ObjectFactory` to allow setting a "Topic" which derives a `context_id`.
    - [x] Update `NetworkMonitor` to show the `context_id` on the wire.
    - [x] Simulate "Blind Routing" where the relay dispatches based on the `context_id`.

- [x] **Task 5: Verification**
    - [x] Add unit tests in `vco-core` for `context_id` integrity.
    - [x] Verify that PoW score calculation still works correctly.
    - [x] Run full workspace build.
