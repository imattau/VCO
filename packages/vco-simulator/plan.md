# Plan: Implement VCO Protocol Simulator

## Objective
Develop a dual-pane simulator that visualizes VCO object creation and network synchronization to demonstrate the protocol's integrity and efficiency.

## Strategy
1.  **Scaffolding**: Initialize `packages/vco-simulator` using React and Tailwind.
2.  **Core Simulator Engine**: Implement a simulated transport layer that connects two virtual nodes.
3.  **UI Layout**: Create the two-pane view (Factory on left, Network on right).
4.  **Protocol Integration**: 
    *   Hook into `@vco/vco-core` for real-time envelope generation.
    *   Hook into `@vco/vco-sync` for the reconciliation visualization.
5.  **Interactivity**: Add controls to "Tamper" with data and "Step" through sync.

## Tasks

- [x] **Task 1: Scaffold Simulator Application**
    - [x] Create `packages/vco-simulator` directory and `package.json`.
    - [x] Set up Vite, Tailwind, and TypeScript configurations.
    - [x] Create base `App.tsx` with dual-pane layout.

- [x] **Task 2: Build Simulated Transport & Node Logic**
    - [x] Implement `SimulatedWire` class that manages delayed event emission and network traces.
    - [x] Create `globalWire` for package-wide logging.

- [x] **Task 3: Implement Object Factory (Left Pane)**
    - [x] Create components to configure and sign `Listing` objects.
    - [x] Add a live view of the "Header Hash", "PoW Score", and "Creator ID".
    - [x] Implement a visual "Signing" feedback loop.

- [x] **Task 4: Implement Network Monitor (Right Pane)**
    - [x] Create a "Live Log" of events being emitted by the wire.
    - [x] Categorize events into System, Transport, Sync, and Object types with visual icons.

- [x] **Task 5: "Prove It" Interactive Features**
    - [x] Add a "Tamper" button to flip a bit in the header hash.
    - [x] Implement simulated relay rejection logic to prove integrity verification.

- [x] **Task 6: Final Polish & Build**
    - [x] Add branding and emerald-themed styling.
    - [x] Verified successful build and type checking.
