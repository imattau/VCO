# Plan: Implement ADR 0003 - Canonical Plain Object Serialization

## Objective
Standardize the serialization of VCO objects (containing `BigInt` and `Uint8Array`) to JSON-safe "Plain Objects" to improve developer ergonomics and consistency across the ecosystem.

## Strategy
1.  **Core Utilities**: Implement `toPlainObject` and `fromPlainObject` in `@vco/vco-core`. These will recursively traverse objects and apply the `n:` (BigInt) and `h:` (Hex/Uint8Array) transformations.
2.  **Schema Support**: Ensure `@vco/vco-schemas` exports these utilities for use with specific data models (Post, Listing, etc.).
3.  **Application Refactoring**: Replace custom serialization logic in `vco-marketplace` and `vco-simulator` with the new core utilities.
4.  **Verification**: Add comprehensive unit tests in `vco-core`.

## Tasks

- [x] **Task 1: Implement Core Serialization in vco-core**
    - [x] Create `packages/vco-core/src/serialization.ts`.
    - [x] Implement `toPlainObject` (recursive, handles BigInt -> `"n:..."`, Uint8Array -> `"h:..."`).
    - [x] Implement `fromPlainObject` (recursive, restores `"n:..."` -> BigInt, `"h:..."` -> Uint8Array).
    - [x] Export from `packages/vco-core/src/index.ts`.

- [x] **Task 2: Add Unit Tests for Serialization**
    - [x] Create `packages/vco-core/test/serialization.test.ts`.
    - [x] Test roundtrip for nested objects, arrays, and all VCO-standard types.

- [x] **Task 3: Refactor vco-marketplace**
    - [x] Replace `packages/vco-marketplace/src/lib/storage.ts` with calls to `@vco/vco-core` serialization.
    - [x] Update `MarketplaceContext.tsx` to use the new standard.

- [x] **Task 4: Refactor vco-simulator**
    - [x] Replace custom `storage.ts` in `vco-simulator`.
    - [x] Update local state persistence.

- [x] **Task 5: Final Verification & Documentation**
    - [x] Run full workspace build.
    - [x] Update ADR 0003 status to "Accepted".
    - [x] Update JSDoc documentation.
