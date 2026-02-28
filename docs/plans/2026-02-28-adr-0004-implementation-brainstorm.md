# Brainstorming: Implementing ADR 0004 - Blind Context Routing and PoW Prioritization

## Objective
Implement the technical changes required by ADR 0004 to support efficient group routing and quality-of-service prioritization in the VCO protocol.

## 1. Schema Updates (`vco.proto`)
- **`Envelope`**: Add `bytes context_id = 11;`.
- **`EnvelopeSigningMaterial`**: Add `bytes context_id = 6;`.
- **`EnvelopeHeaderHashMaterial`**: Add `bytes context_id = 8;`.
- **Note**: Marking it as optional in the library (empty bytes if not used).

## 2. Core Library Changes (`vco-core`)
- **`VcoHeader` Interface**: Add `contextId?: Uint8Array`.
- **`createEnvelope`**: Support `contextId` in the input options. Ensure it's included in signing and header-hash material.
- **Validation**: Ensure `contextId` length is validated (8 bytes as per ADR, or flexible?). ADR says 8 bytes. Let's enforce 8 bytes if present.
- **PoW Utility**: Add `getPowScore(headerHash: Uint8Array): number` (already exists, but ensure it's used for prioritization).

## 3. Prioritization Logic (`vco-sync` / `vco-relay`)
- **Queue Management**: Relays should sort incoming envelopes by their PoW score.
- **Admission**: Use PoW score to decide which envelopes to keep when storage is full.

## 4. Blind Routing Logic
- **Derivation**: Implement a helper to derive the 8-byte `context_id` from a topic string or group ID.
- **Relay Dispatch**: Simulated relay in the simulator should now show "Routing by Context ID" without decrypting.

## 5. Visual Proof (Simulator)
- Add a "Context ID" field to the Object Factory.
- Show the derived 8 bytes.
- Show the Network Monitor performing "Blind Dispatch" based on this ID.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
