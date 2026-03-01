# Plan: Implement ADR 0005 - Unified Uniqueness and Priority Hinting

## Objective
Implement top-level nullifiers for unified replay protection and semantic priority hints for better congestion management, as defined in ADR 0005.

## Strategy
1.  **Schema Evolution**: Update `vco.proto` to move the `nullifier` to the top-level `Envelope` and associated signing/hashing materials.
2.  **Flag Optimization**: Allocate the lower 4 bits of the header flags for `priority_hint`.
3.  **Core Logic**: Update `@vco/vco-core` to enforce mandatory nullifiers for ZKP-Auth and optional ones for Signature-Auth.
4.  **Visual Proof**: Update the Simulator to demonstrate how priority hints and unified nullifiers improve relay performance.

## Tasks

- [x] **Task 1: Update Protobuf Schema**
    - [x] Add `bytes nullifier` to `Envelope`, `EnvelopeSigningMaterial`, and `EnvelopeHeaderHashMaterial` in `vco.proto`.
    - [x] Mark `nullifier` as deprecated in `ZKPExtension` (reserved field 6).
    - [x] Update `generate-proto.mjs` templates and run `npm run proto:gen`.

- [x] **Task 2: Refactor vco-core Constants & Types**
    - [x] Define `PRIORITY_HINT_MASK` and `PriorityLevel` enum in `constants.ts`.
    - [x] Update `VcoHeader` and `Envelope` interfaces in `types.ts` to include `nullifier` and `priorityHint`.

- [x] **Task 3: Implement Priority and Nullifier Logic in vco-core**
    - [x] Update `createEnvelope` to accept `nullifier` and `priorityHint`.
    - [x] Implement `getPriority(flags: number): number` helper.
    - [x] Update `assertEnvelopeIntegrity` to verify the top-level nullifier is part of the commitment.
    - [x] Update `validateEnvelope` to enforce 32-byte length for nullifiers if present.

- [x] **Task 4: Update Simulator Proof**
    - [x] Add a "Priority" selector to the `ObjectFactory`.
    - [x] Update the verifiable structure view to show the top-level `nullifier`.
    - [x] Update `NetworkMonitor` to display priority levels (e.g. "[CRITICAL] New Post").

- [x] **Task 5: Verification**
    - [x] Add unit tests in `vco-core` verifying that a tampered nullifier fails verification.
    - [x] Test the sorting logic combining PoW score and Priority Hint.
    - [x] Run full workspace build.
