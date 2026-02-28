# Brainstorming: Persistent Storage for VCO Marketplace

## Objective
Implement local persistence for marketplace data (listings, offers, receipts) so that user information and transaction history are retained across application restarts.

## Current State
- **Identity**: Already persistent via `localStorage` in `IdentityContext.tsx`.
- **Marketplace Data**: Currently ephemeral. `listings`, `offers`, and `receipts` are stored in React state in `MarketplaceContext.tsx` and reset on every refresh.

## Data to Persist
1.  **Listings**: My own created listings and listings discovered from the network.
2.  **Offers**: Both outgoing offers (I made) and incoming offers (I received).
3.  **Receipts**: Completed transaction receipts.

## Persistence Strategies

### 1. `localStorage` (Standard Web)
- **Pros**: Easy to implement; consistent with `vco-desktop` and `IdentityContext`.
- **Cons**: Size limits (usually 5MB); not ideal for large numbers of objects or media.
- **Complexity**: Low.

### 2. IndexedDB (Structured Web Storage)
- **Pros**: Handles much larger data sets; supports indexes for faster searching.
- **Cons**: More complex API; might be overkill for an MVP.
- **Complexity**: Medium.

### 3. Tauri Filesystem (Native)
- **Pros**: No size limits; data persists in standard user directories (e.g., `~/.local/share/vco-marketplace`).
- **Cons**: Requires Tauri-specific logic; less portable if we ever want a pure web version.
- **Complexity**: High (requires Rust sidecar or Tauri FS plugin).

## Proposed Approach: `localStorage` with JSON Serialization
For the MVP, I recommend using `localStorage` to mirror the simplicity of `vco-desktop`.

### Implementation Details
- **Serialization**: Use `JSON.stringify` and `JSON.parse`. 
- **BigInt Handling**: Since VCO schemas use `BigInt` (e.g., `priceSats`, `timestampMs`), we need a custom replacer/reviver for JSON to avoid "Do not know how to serialize a BigInt" errors.
- **Hooks**: Use a `useEffect` in `MarketplaceProvider` to load data on mount and a `useEffect` or manual calls to save data when the state changes.

## Next Steps
1.  Define a helper for JSON BigInt serialization.
2.  Update `MarketplaceContext.tsx` to load/save state.
3.  Add a "Clear Local Storage" button in settings for debugging.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
