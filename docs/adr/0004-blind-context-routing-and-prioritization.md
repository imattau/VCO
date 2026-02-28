# ADR 0004: Blind Context Routing and PoW Prioritization

## Status
Accepted

## Context
The development of the Transport Obfuscation Layer (TOL) and the Protocol Simulator revealed a performance bottleneck in high-traffic group messaging and decentralized discovery. When `OBFUSCATED = 1`, a receiver (or relay) must fully decrypt and decode an envelope before it can determine the message's category or destination. This prevents efficient routing and allows for "Decryption Flood" attacks where a malicious peer sends millions of valid-sized but irrelevant packets.

Additionally, the simulator demonstrated that Proof-of-Work (PoW) is currently used primarily as a binary admission filter rather than a dynamic prioritization signal.

## Decision
- Introduce an optional **"Blind Context ID" (BCID)** field to the `VcoHeader`.
    - **Length**: 8 bytes.
    - **Derivation**: Derived from a HMAC of the Topic/Group ID, ensuring it is opaque to global observers but recognizable to members.
- Update the **Relay Admission Policy** to support "Blind Dispatching" based on the BCID without content inspection.
- Formalize **PoW-based Quality of Service (QoS)**:
    - Relays MUST use the `pow_score` (leading zero bits of the header hash) to prioritize internal processing and propagation queues.
    - During network congestion, envelopes with higher PoW scores MUST be processed before those with lower scores.

## Consequences
- **Scalability**: Enables high-performance routing for groups and topics without compromising content privacy.
- **Resilience**: Protects against CPU-exhaustion attacks by allowing receivers to drop irrelevant context-ids before decryption.
- **Fairness**: Legitimate users can "buy" priority during high-load periods by performing additional computational work.
