# Brainstorming: Proving ZKP-Auth in the VCO Protocol Simulator

## Objective
Enhance the VCO Protocol Simulator to demonstrate and "prove" the ZKP-Auth mechanism (Section 3 of the SPEC), showing how users can post verifiable content without revealing their identity.

## Core Concepts to Prove

### 1. Anonymous Identity (Zeroed Fields)
- **Proof**: Show that when `ZKP_AUTH` flag is set, `creator_id` and `signature` are literally zeroed out or omitted from the envelope.
- **Visualization**: Contrast a standard post (showing the Ed25519 multikey) with an anonymous post (showing 0x00...00).

### 2. Verifiable Membership (ZKPExtension)
- **Proof**: Show the `ZKPExtension` metadata (circuit_id, proof bytes, nullifier) being attached to the envelope.
- **Visualization**: A "Proof Generator" UI that simulates generating a membership proof for a specific group (e.g., "Verified Humans").

### 3. Relay-Side ZKP Verification
- **Proof**: Demonstrate that the simulated relay can validate the post's legitimacy using ONLY the ZKP, without knowing who signed it.
- **Visualization**: The Network Monitor showing "Relay: Verifying ZKP (Circuit: 0x01)... SUCCESS".

### 4. Nullifier & Replay Protection (The "Double Post" Proof)
- **Proof**: Demonstrate that trying to send the same post (or a different post with the same nullifier) results in immediate rejection.
- **Visualization**: 
    1. Post anonymously once -> SUCCESS.
    2. Attempt to post anonymously again with same nullifier -> REJECTED: Nullifier Replay.

## Proposed Simulator Features
1. **"Post Anonymously (ZKP)" Toggle**: In the Object Factory, add a mode to generate ZKP-based envelopes.
2. **"Circuit Selector"**: Allow choosing a simulated circuit (e.g., "Group Membership", "Proof of Balance").
3. **"Nullifier Dashboard"**: Show the simulated relay's `NullifierStore` growing as anonymous posts are received.
4. **"Double-Spend" Button**: A quick way to attempt a replay attack to see the rejection logic.

## Technical Implementation
- **Mock Verifier**: Register a mock `IZKPVerifier` in the simulator's core instance that "validates" any proof but tracks nullifiers.
- **Envelope Generation**: Update `lib/vco.ts` to support building envelopes with `zkpExtension` and zeroed `creator_id`.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
