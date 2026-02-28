# Brainstorming: VCO Protocol Error Handling

## Objective
Analyze the current state of error handling in the VCO protocol ecosystem and identify opportunities for improvement, such as standardization and centralization.

## Current State Analysis

### 1. Centralized Errors in `vco-core`
- **Module**: `packages/vco-core/src/errors.ts`
- **Class**: `EnvelopeValidationError` (extends `Error`).
- **Usage**: Heavily used across `vco-core` (`envelope.ts`, `validation.ts`, `fragmentation.ts`, `pow.ts`) for data integrity and protocol compliance failures.

### 2. Ad-hoc Errors in Other Packages
- **`vco-sync`**: Uses generic `new Error()` for internal logic failures (bisect errors, range proof validation, negentropy adapter issues).
- **`vco-crypto`**: Throws generic `new Error("No crypto provider configured...")` when the global provider is missing.
- **`vco-schemas`**: Throws generic `new Error()` for schema URI mismatches.
- **`vco-cord`**: Uses generic errors for context requirements (e.g., `useIdentity requires IdentityProvider`).

### 3. Native & External Errors
- **libp2p**: Packages like `vco-transport` inherit errors from the libp2p ecosystem (e.g., dial failures, stream reset).
- **Protobuf**: Protobufjs throws errors during encoding/decoding if the wire format is invalid.

## Identified Issues
- **Inconsistency**: High-level packages use generic `Error` while `vco-core` is more disciplined. This makes it harder for consumers to programmatically distinguish between different failure modes (e.g., a network error vs. a protocol validation error).
- **Poor Observability**: Generic errors often lack structured metadata (error codes, diagnostic context) which complicates debugging in production environments like the `vco-relay`.
- **Duplicate Logic**: Multiple packages manually check constraints (e.g., `is uint32`) and throw similar but slightly different error strings.

## Proposed Approaches

### Approach A: The "Monolithic Error Registry"
Expand `vco-core/src/errors.ts` into a comprehensive registry for the entire ecosystem.
- **Pros**: Single source of truth; easy for consumers to import all possible error types.
- **Cons**: Increases `vco-core` bundle size; creates circular dependencies if `vco-core` needs to know about `vco-sync` specific errors.

### Approach B: Modular Error Hierarchy (Recommended)
Define a base `VcoError` in `vco-core` and have each package extend it with specialized classes.
- **`vco-core`**: `VcoError` -> `EnvelopeValidationError`, `MultiformatError`.
- **`vco-sync`**: `VcoError` -> `SyncProtocolError`, `ReconciliationError`.
- **`vco-transport`**: `VcoError` -> `TransportSessionError`.
- **Pros**: Maintains modular boundaries; allows specific `try/catch` logic per layer; highly standard.

### Approach C: Result-based Pattern (ZKP/Rust Style)
Instead of throwing, return a `Result<T, E>` object (common in Rust and some high-integrity JS libs).
- **Pros**: Eliminates "surprise" crashes; forces error handling.
- **Cons**: Major refactor of existing APIs; less idiomatic for many JS developers.

## Next Steps / Strategy
1.  **Define `VcoError` Base**: Create a structured base class in `vco-core` that includes an error code and optional metadata.
2.  **Audit `vco-sync`**: Start replacing generic `new Error()` calls with specialized subclasses.
3.  **Standardize Relay Response**: Map these internal errors to appropriate HTTP/JSON-RPC status codes in the relay.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
