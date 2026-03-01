# Plan: VCO Discovery Component Refinement & Expansion

**Goal**: Move `vco-discovery` towards a production-ready application architecture by replacing mocks with contexts and implementing the missing "Browse Nodes" and "Reputation" views.

## Tasks

### 1. Architectural Hardening [DONE]
- [x] Implement `DiscoveryContext` in `src/features/discovery/DiscoveryContext.tsx`
- [x] Migrate `SearchBar` and `SearchResults` to use `useDiscovery` instead of direct `DiscoveryService` calls
- [x] Add persistence (Local Storage for now) to `DiscoveryService` for Search History and submitted Reports

### 2. Implementation: Browse Nodes View [DONE]
- [x] Create `BrowseNodes.tsx` component in `src/features/nodes/`
- [x] Implement a node card showing `RelayAdmissionPolicy` data (PoW, Max Size, Blind Routing status)
- [x] Add a "Connect" simulation button for each node
- [x] Update `App.tsx` navigation for "Browse Nodes"

### 3. Implementation: Reputation & Alerts View [DONE]
- [x] Create `AlertsDashboard.tsx` in `src/features/moderation/`
- [x] Implement a reputation score visualization (color-coded progress bars/meters)
- [x] Display a "Global Alerts" list for high-severity `Report` objects

### 4. Security & Cryptographic Signing [DONE]
- [x] Integrate `@vco/vco-crypto` (simulation) in `ReportForm` to show "Signing..." state more authentically
- [x] Add CID pattern validation (regex/multihash) to input fields

### 5. Verification [DONE]
- [x] Build and typecheck the expanded application
- [x] Verify that new views correctly route in the sidebar

## References
- `packages/vco-cord/src/features/identity/IdentityContext.js`: For context pattern
- `packages/vco-schemas/src/network/policy.ts`: For node property alignment
