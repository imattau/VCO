# Plan: Implement 'Buy' and 'Receipt' functionality

## Objective
Implement the 'Buy Now' flow for buyers and the 'Accept Offer' (Receipt) flow for sellers in the `vco-marketplace` application.

## Strategy
1.  **Core Logic**: Add `buildReceipt` to `lib/vco.ts` to support transaction confirmation.
2.  **Buyer Flow**: Update `ListingDetail` to support an instant purchase action.
3.  **Seller Flow**: Implement the acceptance logic in `OffersList` to generate receipts.
4.  **Persistence**: Ensure receipts are stored in the local `MarketplaceContext`.

## Tasks

- [x] **Task 1: Extend vco.ts with Receipt Logic**
    - [x] Import `RECEIPT_SCHEMA_URI` and `encodeReceipt` from `@vco/vco-schemas`.
    - [x] Implement `buildReceipt(data: { listingId: string; offerId: string; txId: string }, identity: Identity): Promise<Uint8Array>`.

- [x] **Task 2: Implement 'Buy Now' in UI**
    - [x] Update `ListingDetail.tsx` to add a "Buy Now" button next to "Make Offer".
    - [x] Implement `onBuyNow` handler in `App.tsx` that calls `buildOffer` with the full listing price.

- [x] **Task 3: Implement 'Accept Offer' in UI**
    - [x] Update `OffersList.tsx` to connect the checkmark button to an `onAccept` callback.
    - [x] Implement `handleAcceptOffer` in `App.tsx` that calls `buildReceipt` and publishes it.

- [x] **Task 4: Update State Management**
    - [x] Update `MarketplaceContext.tsx` to include an `offers` and `receipts` state if not fully implemented.
    - [x] Add `addReceipt` function to the context.

- [x] **Task 5: Verification**
    - [x] Add unit tests for `buildReceipt` roundtrip.
    - [x] Verify build and UI interactions.
