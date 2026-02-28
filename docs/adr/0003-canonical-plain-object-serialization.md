# ADR 0003: Canonical Plain Object Serialization

## Status
Accepted

## Context
During the development of the VCO Protocol Simulator and Marketplace applications, a recurring challenge emerged regarding the developer ergonomics of handling VCO objects in JavaScript/TypeScript environments. VCO schemas heavily utilize `BigInt` (for micro-denominations and timestamps) and `Uint8Array` (for CIDs and public keys). Neither of these types is natively supported by `JSON.stringify()`, leading to "Do not know how to serialize a BigInt" errors and silent data loss for byte arrays.

Currently, every application must implement its own custom JSON replacer/reviver or manual mapping logic, which is redundant and error-prone.

## Decision
- Implement a canonical "Plain Object" representation for all VCO types and schemas.
- Provide standardized `toPlainObject()` and `fromPlainObject()` utility functions in `@vco/vco-core` and `@vco/vco-schemas`.
- Standardize the serialization format for non-JSON types:
    - **BigInt**: Serialized as a string with a prefix (e.g., `"n:1000"`).
    - **Uint8Array**: Serialized as a hex-encoded string with a prefix (e.g., `"h:deadbeef..."`).
- Ensure these utilities are recursively applied to nested objects and arrays.

## Consequences
- **Improved Developer Experience**: Developers can store VCO objects in `localStorage`, databases, or logs using a single standard call.
- **Consistency**: All VCO-compatible applications will share a common diagnostic and storage format.
- **Interoperability**: Easier to inspect and debug verifiable objects in web browsers and CLI tools.
