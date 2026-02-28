# Plan: Develop VCO Marketplace Application

## Objective
Implement a functional MVP of the decentralized VCO Marketplace application, supporting listing discovery, creation, and simple offer flows using structured VCO schemas.

## Strategy
1.  **Scaffolding**: Set up the project structure, build tools (Vite, Tailwind), and Tauri configuration.
2.  **Core Components**: Develop the base UI layout (Sidebar, Item Feed, Detail View).
3.  **Schema Integration**: Implement helper functions to build and decode `Listing`, `Offer`, and `Receipt` envelopes.
4.  **Discovery Layer**: Integrate with `@vco/vco-sync` to pull listings from available relays.
5.  **Interactive Flows**: Implement the UI for creating listings and making offers.

## Tasks

- [ ] **Task 1: Scaffold Application Infrastructure**
    - [ ] Initialize Tauri in `packages/vco-marketplace`.
    - [ ] Set up `tsconfig.json` and `vite.config.ts`.
    - [ ] Configure Tailwind CSS.
    - [ ] Create entry points (`index.html`, `src/main.tsx`).

- [ ] **Task 2: Define Marketplace Identity & State**
    - [ ] Port `IdentityContext` from `vco-cord` for persistent user profiles.
    - [ ] Create `MarketplaceContext` to manage local listings and offer state.

- [ ] **Task 3: Implement Listing UI**
    - [ ] Create `ListingCard` and `ListingFeed` components.
    - [ ] Develop `ListingDetail` view with purchase actions.
    - [ ] Build `CreateListingForm` modal.

- [ ] **Task 4: Implement Offer & Transaction Logic**
    - [ ] Add "Make Offer" functionality that publishes an `Offer` schema object.
    - [ ] Implement "My Sales" view for sellers to see incoming offers.
    - [ ] Implement "Accept Offer" which generates a `Receipt` and notifies the buyer.

- [ ] **Task 5: Messaging & Negotiation**
    - [ ] Integrate a simplified version of `vco-cord` messaging for item-specific negotiations.
    - [ ] Link messages to Listing/Offer CIDs via tags.

- [ ] **Task 6: Verification & Testing**
    - [ ] Add unit tests for marketplace schema roundtrips in the app context.
    - [ ] Verify build and Tauri development environment.
