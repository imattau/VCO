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

- [x] **Task 1: Scaffold Application Infrastructure**
    - [x] Initialize Tauri in `packages/vco-marketplace`.
    - [x] Set up `tsconfig.json` and `vite.config.ts`.
    - [x] Configure Tailwind CSS.
    - [x] Create entry points (`index.html`, `src/main.tsx`).

- [x] **Task 2: Define Marketplace Identity & State**
    - [x] Port `IdentityContext` from `vco-cord` for persistent user profiles.
    - [x] Create `MarketplaceContext` to manage local listings and offer state.

- [x] **Task 3: Implement Listing UI**
    - [x] Create `ListingCard` and `ListingFeed` components.
    - [x] Develop `ListingDetail` view with purchase actions.
    - [x] Build `CreateListingForm` modal.

- [x] **Task 4: Implement Offer & Transaction Logic**
    - [x] Add "Make Offer" functionality that publishes an `Offer` schema object.
    - [x] Implement "My Sales" view for sellers to see incoming offers.
    - [x] Implement "Accept Offer" logic (basic UI).

- [x] **Task 5: Messaging & Negotiation**
    - [x] Integrate building Offer envelopes into `lib/vco.ts`.
    - [x] Link offers to Listing CIDs.

- [x] **Task 6: Verification & Testing**
    - [x] Add unit tests for marketplace schema roundtrips in the app context.
    - [x] Verify build and Tauri development environment.
