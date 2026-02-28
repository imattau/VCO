# Plan: Sold States and Trade History Implementation

## Objective
Implement visual "Sold" states for listings and a verifiable trade history view in the `vco-marketplace` application.

## Strategy
1.  **Context Integration**: Fully implement `addReceipt` in `MarketplaceContext` and ensure it's used during the offer acceptance flow.
2.  **UI Feedback (Cards)**: Update `ListingCard` to display a "SOLD" status based on the existence of a receipt.
3.  **UI Feedback (Detail)**: Update `ListingDetail` to prevent new offers on sold items.
4.  **History View**: Implement a `TradeHistory` component to display completed receipts in the "Offers" tab.
5.  **Optimistic acceptance**: Refactor `handleAcceptOffer` to update local state immediately.

## Tasks

- [x] **Task 1: Update Marketplace Context & Logic**
    - [x] Ensure `addReceipt` is correctly implemented in `MarketplaceContext.tsx`.
    - [x] Add a derived helper or state to quickly check if a listing is sold.

- [x] **Task 2: Implement Sold State in Listing UI**
    - [x] Update `ListingCard.tsx` to show a "SOLD" badge and dim the card if a receipt exists for its ID.
    - [x] Update `ListingDetail.tsx` to show "Transaction Complete" and disable purchase buttons for sold items.

- [x] **Task 3: Implement Trade History View**
    - [x] Create `packages/vco-marketplace/src/features/listings/TradeHistory.tsx`.
    - [x] Display a list of receipts, distinguishing between sales and purchases.
    - [x] Include the transaction ID and item title.

- [x] **Task 4: Finalize Acceptance Flow**
    - [x] Update `handleAcceptOffer` in `App.tsx` to call `addReceipt` optimistically.
    - [x] Use `decodeReceiptEnvelope` from `lib/vco.ts` to add the newly created receipt to state.

- [x] **Task 5: Update App Navigation**
    - [x] Add a "History" sub-tab to the "Offers" section in `App.tsx`.
    - [x] Connect the new `TradeHistory` component.

- [x] **Task 6: Verification**
    - [x] Verify that accepting an offer marks the listing as sold in the browse feed.
    - [x] Verify that the transaction appears in the "History" tab for both buyer and seller.
    - [x] Run build and test suite.
