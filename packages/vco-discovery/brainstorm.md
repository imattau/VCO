# Brainstorming: VCO Discovery Missing Components

**Context**: The `vco-discovery` app is currently a high-fidelity prototype demonstrating schema serialization and UI layouts. To align with `vco-cord` and `vco-desktop`, it needs to move from pure mocking to integrated functionality.

## 1. Feature Gaps (Discovery Hub)
The current UI sidebar references features that are not yet implemented:
- **Browse Nodes**: A view to discover and list active relay nodes (RelayAdmissionPolicy aggregation).
- **Alerts & Reports**: A dashboard to monitor high-severity reports across the network.
- **Node Reputation**: Visualizing the reputation score mentioned in the `RelayAdmissionPolicy`.

## 2. Infrastructure & Integration
- **Transport Layer**: Integration with `@vco/vco-node` or `@vco/vco-core` to perform real libp2p searches instead of `DiscoveryService` mocks.
- **Persistence**: Using a local store (e.g., IndexedDB or Tauri-sidecar persistence) to save search history and submitted reports.
- **State Management**: Moving from `CustomEvent` and local `useState` to a more robust `IdentityContext` or `DiscoveryContext` (matching the `IdentityProvider` pattern in `vco-cord`).

## 3. Security & Validation
- **Cryptographic Signing**: Actually signing the `Report` and `RelayAdmissionPolicy` objects using `@vco/vco-crypto` (Identity/DID keys).
- **ZKP Auth Flow**: Implementing the UI for the "ZKP Authentication" toggle in `NodeSettings`.
- **CID Validation**: Adding real CID parsing/validation logic to the input fields.

## 4. UX Refinements
- **Pagination**: The `KeywordIndex` schema supports a `nextPageCid`, but the UI currently displays a single list.
- **Weighted Sorting**: Automatically sorting search results by the `weight` property in the `KeywordIndex`.
- **Direct Action**: Clicking a search result should offer actions (e.g., "Inspect", "Download", "Report").

## Technical Approach Options
- **Option A (Tauri Integration)**: Add `src-tauri` to `vco-discovery` to allow it to run as a desktop app with native capabilities (like `vco-cord`).
- **Option B (Context-First)**: Implement a `DiscoveryContext` that abstracts the `DiscoveryService` so it can switch between `Mock` and `Real` providers.
- **Option C (ZKP Sandbox)**: Focus on the "Monetization/Subscription" schema integration mentioned in ADRs but not yet in the UI.

**Recommendation**: Proceed with **Option B** to harden the internal architecture, followed by implementing the **Browse Nodes** and **Reputation** features.
