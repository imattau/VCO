# Plan: Modular Error Hierarchy for VCO Protocol

## Objective
Implement a standardized, modular error hierarchy across the VCO protocol monorepo to improve error observability, programmatic handling, and consistency.

## Strategy
1.  **Base Class**: Define a `VcoError` base class in `@vco/vco-core` that supports structured error codes and optional metadata.
2.  **Specialization**: Extend `VcoError` into specific error classes within each package (e.g., `EnvelopeValidationError`, `SyncProtocolError`).
3.  **Refactoring**: Systematically replace generic `new Error()` calls with the new structured error classes.

## Tasks

- [x] **Task 1: Define Base VcoError in vco-core**
    - [x] Create/Update `packages/vco-core/src/errors.ts` with `VcoError` base class.
    - [x] Add `VcoErrorCode` enum for standard protocol error codes.
    - [x] Update `EnvelopeValidationError` to extend `VcoError`.

- [x] **Task 2: Implement Specialized Errors in vco-core**
    - [x] Add `MultiformatError` for multicodec/multihash failures.
    - [x] Add `CryptoProviderError` for missing or failing crypto providers.
    - [x] Refactor `envelope.ts`, `pow.ts`, and `multiformat.ts` to use these specific classes.

- [x] **Task 3: Refactor vco-crypto for Consistency**
    - [x] Create `packages/vco-crypto/src/errors.ts`.
    - [x] Define `CryptoError` (Independent of `VcoError` to avoid circular dependency).
    - [x] Replace generic errors in `index.ts`.

- [x] **Task 4: Introduce Structured Errors to vco-sync**
    - [x] Create `packages/vco-sync/src/errors.ts`.
    - [x] Define `SyncError` and `SyncProtocolError`.
    - [x] Refactor `negentropy-adapter.ts` to use these instead of generic `Error`.

- [x] **Task 5: Verification and Documentation**
    - [x] Ensure all core packages build successfully.
    - [x] Add a unit test in `vco-core` to verify error structure (code, message, name).
    - [x] Update JSDoc to reflect potential thrown errors (Completed in core files).
