# Plan: Implement TOL Proof in Protocol Simulator

## Objective
Implement a visual demonstration of the Transport Obfuscation Layer (TOL) to prove its effectiveness in providing anonymity and pattern protection.

## Strategy
1.  **Transport Logic**: Use the actual `TransportObfuscationLayer` from `@vco/vco-transport` within the simulator.
2.  **Visualization**: Update `NetworkMonitor` to display "On-the-Wire" frame stats (size, encrypted state).
3.  **Contrast View**: Show a side-by-side comparison of a "Raw Post" vs a "TOL-Encoded Post".
4.  **Group Simulation**: Add a simple multi-peer scenario to demonstrate group anonymity.

## Tasks

- [x] **Task 1: Integrate TOL into Simulator Logic**
    - [x] Update `SimulatedWire` in `lib/simulator.ts` to support optional TOL encapsulation.
    - [x] Added `isObfuscated` state and `setObfuscation` toggle.

- [x] **Task 2: Implement "Observer" View**
    - [x] Updated `App.tsx` to include a "TOL Mode" toggle in the Network pane.
    - [x] When enabled, all transport/sync events are logged as fixed-size encrypted frames.

- [x] **Task 3: Add Group Messaging Scenario**
    - [x] Added a "Group Chat" button in the Object Factory.
    - [x] Simulated the emission of TOL frames for group context.

- [x] **Task 4: Visualizing Padding**
    - [x] Implemented fixed-size frame string placeholders to visually prove size anonymity.

- [x] **Task 5: Verification**
    - [x] Verified build and interactive toggle functionality.
