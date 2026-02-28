# Brainstorming: Sold States and Trade History in VCO Marketplace

## Objective
Implement a verifiable transaction lifecycle where listings can be marked as "Sold" upon receipt generation, and users can view their historical completed trades.

## 1. Defining "Sold" State
In a decentralized environment, an item is "Sold" when a valid `Receipt` object exists that references both the `Listing` and an `Offer`.
- **UI Logic**: A listing should be considered sold if its CID matches the `listingCid` in any receipt known to the client.
- **Visuals**:
    - **Listing Card**: Overlay a "SOLD" ribbon or badge. Greyscale the thumbnail.
    - **Listing Detail**: Replace "Buy Now" and "Make Offer" buttons with a "Transaction Complete" status and a link to the Receipt CID.

## 2. Trade History View
Users need a way to see their verifiable success stories.
- **Location**: A sub-tab within "Offers" or a dedicated "History" tab.
- **Content**:
    - **Sales History**: Receipts where the current user is the seller.
    - **Purchase History**: Receipts where the current user is the buyer.
- **Display**: Show the item title, the final price (from the offer), the transaction ID, and the timestamp.

## 3. Receipt Verification
- **Trust**: The UI should indicate that the receipt is a signed VCO object.
- **Inspector**: Allow clicking a receipt to open the `VcoInspector` (reusing the logic from `vco-cord`).

## 4. Technical Implementation Details
- **Context Update**: `addReceipt` should be fully functional and trigger a re-render of affected listings.
- **Optimistic Updates**: When `handleAcceptOffer` is called, immediately add the receipt to the state.
- **Filtering**:
    - "Browse": Optionally hide sold items or move them to the end of the list.
    - "My Listings": Show status (Active/Sold) for each item.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
