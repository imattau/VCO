# Plan: Implement Persistent Storage for Marketplace Data

## Objective
Enable data persistence for listings, offers, and receipts using `localStorage`, ensuring information is retained across sessions.

## Strategy
1.  **Serialization Helper**: Implement a JSON replacer/reviver to handle `BigInt` and `Uint8Array` types used in VCO objects.
2.  **Context Refactor**: Update `MarketplaceContext.tsx` to load initial state from `localStorage` and persist changes whenever listings, offers, or receipts are updated.
3.  **Namespace Keys**: Use unique keys (e.g., `vco_marketplace_listings`) to prevent collisions.

## Tasks

- [x] **Task 1: Implement Serialization Utilities**
    - [x] Create `packages/vco-marketplace/src/lib/storage.ts`.
    - [x] Implement `serialize(data: any): string` and `deserialize<T>(json: string): T`.
    - [x] Ensure `BigInt` is converted to string with a prefix and `Uint8Array` is handled via hex.

- [x] **Task 2: Update MarketplaceContext for Persistence**
    - [x] Load `listings`, `offers`, and `receipts` from `localStorage` in a `useEffect` on mount.
    - [x] Add a `useEffect` that watches `listings`, `offers`, and `receipts` and writes them to `localStorage` on every change.

- [x] **Task 3: Refine Persistence Triggers**
    - [x] Ensure `addListing`, `addOffer`, and `addReceipt` state updates are correctly captured by the persistence hook.

- [ ] **Task 4: Verification**
    - [ ] Verify that creating a listing persists after a page refresh.
    - [ ] Verify that making an offer persists after a page refresh.
    - [ ] Verify that accepting an offer (receipt) persists after a page refresh.
    - [ ] Check for any performance issues during large state writes.
