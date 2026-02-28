# Plan: Demonstrate PoW Spam Protection

## Objective
Enhance the VCO Protocol Simulator to explicitly prove how Proof-of-Work (PoW) prevents network spamming by contrasting a valid (costly) broadcast with a high-volume (cheap) spam attack.

## Strategy
1.  **"Spam Attack" Action**: Add a button to the Object Factory that attempts to send 50 envelopes per second without PoW.
2.  **Network Visualization**: Update the Network Activity pane to show the simulated relay identifying and dropping the zero-PoW spam.
3.  **UI Feedback**: Show a comparison of "Network Health" or "Relay Load" during the attack.

## Tasks

- [ ] **Task 1: Implement Simulated Spam Logic**
    - [ ] Add `globalWire.simulateSpam()` which emits 50 low-PoW events in rapid succession.
    - [ ] Update `NetworkMonitor` to display these events with a specific "Rejected" style.

- [ ] **Task 2: Update Object Factory UI**
    - [ ] Add a "Launch Spam Attack (0 PoW)" button.
    - [ ] Add tooltip/explanation: "This button attempts to flood the relay without performing computational work."

- [ ] **Task 3: Refine Network Monitor Feedback**
    - [ ] Show a counter of "Dropped Spam Envelopes".
    - [ ] Highlight how the valid PoW object from the factory still gets through while the spam is filtered.

- [ ] **Task 4: Verification**
    - [ ] Verify the animation and log volume doesn't crash the browser.
    - [ ] Ensure the "Proof" is clear to the user.
