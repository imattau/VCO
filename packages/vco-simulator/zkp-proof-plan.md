# Plan: Implement ZKP-Auth Proof in Protocol Simulator

## Objective
Implement a visual demonstration of the ZKP-Auth mechanism in the `vco-simulator` to prove identity-less verification and replay protection.

## Strategy
1.  **Protocol Helpers**: Update `lib/vco.ts` to support building ZKP-authenticated envelopes.
2.  **Mock Verifier**: Implement a simple ZKP verifier in the simulator logic.
3.  **UI Updates**:
    *   Add "Anonymous Mode" to `ObjectFactory`.
    *   Visualize zeroed identity fields and the `ZKPExtension` structure.
    *   Add a "Replay Attack" demonstration.
4.  **Network Logic**: Update `SimulatedWire` to log ZKP-specific verification steps.

## Tasks

- [ ] **Task 1: Extend vco.ts with ZKP Logic**
    - [ ] Implement `buildZkpEnvelope(payload: Uint8Array, circuitId: number, identity: Identity): Promise<Uint8Array>`.
    - [ ] Ensure `creator_id` and `signature` are zeroed out when the ZKP flag is set.

- [ ] **Task 2: Implement Anonymous Mode in Object Factory**
    - [ ] Add a toggle for "Anonymous Post (ZKP)".
    - [ ] Display the generated `nullifier` and `proof` bytes.
    - [ ] Show the zeroed `creator_id` field in the verifiable structure view.

- [ ] **Task 3: Implement Replay Protection Simulation**
    - [ ] Add a "Replay Last ZKP" button.
    - [ ] When clicked, emit a network event that the simulated relay rejects due to a "Seen Nullifier".

- [ ] **Task 4: Update Network Monitor Logs**
    - [ ] Add specific logs for "Relay: Verifying ZKP..." and "Relay: Nullifier Check...".
    - [ ] Show the transition from "Signature Verification" (for standard posts) to "ZKP Verification" (for anonymous ones).

- [ ] **Task 5: Verification**
    - [ ] Verify that ZKP envelopes are correctly formed according to Section 2.2 of the SPEC.
    - [ ] Ensure the "Proof of Anonymity" is visually distinct and clear.
