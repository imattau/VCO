# Plan: Implement the Offers Section

## Objective
Create a comprehensive "Offers" section in the `vco-marketplace` app to manage incoming and outgoing purchase offers.

## Strategy
1.  **Refactor Tabs**: Rename "Sales & History" to "Offers" and add a sub-toggle for "Buying" vs "Selling".
2.  **Filter Logic**: Distinguish between offers made *by* the user and offers received *by* the user.
3.  **Enhance OffersList**: Update the component to display counterparty information correctly for both directions.
4.  **UI Updates**: Update the sidebar and main layout to reflect the new structure.

## Tasks

- [x] **Task 1: Update Application State & Navigation**
    - [x] Rename the `sales` tab to `offers` in `App.tsx`.
    - [x] Add `offerType` state (`"buying" | "selling"`) to the `Layout` component.
    - [x] Update the Sidebar UI to show "Offers" instead of "Sales & History".

- [x] **Task 2: Refine Filtering Logic**
    - [x] In `App.tsx`, calculate `incomingOffers` (where user is the seller).
    - [x] Calculate `outgoingOffers` (where user is the buyer).

- [x] **Task 3: Enhance OffersList Component**
    - [x] Update `OffersList.tsx` to accept a `mode` prop (`"buying" | "selling"`).
    - [x] Display "To: [Seller Name]" in buying mode and "From: [Buyer Name]" in selling mode.
    - [x] Hide "Accept/Reject" buttons in buying mode.

- [x] **Task 4: Update Layout UI**
    - [x] Add a sub-navigation bar (pills or tabs) when the "Offers" tab is active.
    - [x] Switch between `incomingOffers` and `outgoingOffers` based on the sub-nav state.

- [x] **Task 5: Verification**
    - [x] Verify that making an offer correctly shows up in the "Buying" list.
    - [x] Verify that listings created by the user correctly receive and display "Selling" offers.
    - [x] Run build and check for TS errors.
