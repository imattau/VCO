# ADR 0005: Unified Uniqueness Tracking and Semantic Priority Hinting

## Status
Proposed

## Context
The development of the VCO Protocol Simulator identified two distinct performance and logic gaps in the current envelope structure:

1.  **Fragmented Uniqueness Check**: Replay protection for Signature-Auth envelopes relies on the `header_hash`. For ZKP-Auth envelopes, it relies on a `nullifier` trapped inside the `ZKPExtension` block. This forced relays to implement two different indexing paths for uniqueness.
2.  **Blind Congestion Management**: While ADR 0004 introduced PoW-based prioritization, relays still cannot distinguish between the *intent* of different traffic types (e.g., a critical transaction vs. a transient social like) without performing a full decryption and decode.

## Decision
- **Promote Nullifier to Top-Level**: Add an optional 32-byte `nullifier` field to the `Envelope`.
    - For ZKP-Auth, this field is mandatory and MUST contain the circuit nullifier.
    - For Signature-Auth, this field is optional but can be used for application-level idempotency.
    - Relays MUST maintain a single "Uniqueness Index" that tracks both `header_hashes` and `nullifiers`.
- **Introduce Semantic Priority Hint**: Add a 4-bit `priority_hint` to the `VcoHeader` (reusing reserved flag bits).
    - **Values**: `0: LOW` (default), `1: NORMAL`, `2: HIGH`, `3: CRITICAL`.
    - This hint is non-normative (untrusted) but serves as a signal for relays to bin traffic into separate processing buffers before full validation.
- **Update Reserved Flags**: Formally reduce the `RESERVED_FLAG_MASK` from `0x0f` to `0x03` to accommodate the priority hint.

## Consequences
- **Relay Efficiency**: Relays can perform a single "seen" check for all incoming traffic regardless of authentication type.
- **Improved QoS**: Relays can prioritize "CRITICAL" priority bins during high load, ensuring that high-work, high-priority envelopes are never bottlenecked by low-priority "noise" traffic.
- **Simplified ZKP Integration**: Removes the need for circuit-specific nullifier extraction logic in the core relay implementation.
