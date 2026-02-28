# Brainstorming: Implementing 'Buy' functionality in VCO Marketplace

## Objective
Define the transaction completion flow in the VCO Marketplace, specifically focusing on the 'Buy' action from a buyer and the corresponding 'Accept' action from a seller.

## Transaction Flow Analysis

### 1. The 'Buy Now' Action (Buyer)
- **Concept**: A quick way for a buyer to express intent to purchase at the full listed price.
- **Implementation**:
    - Add a "Buy Now" button to the `ListingDetail` view.
    - When clicked, it automatically generates an `Offer` object with `offerSats` equal to the `Listing`'s `priceSats`.
    - It skips the "negotiation message" or uses a default one like "I would like to buy this item at the listed price."
- **Data Model**: Uses `vco://schemas/marketplace/offer/v1`.

### 2. The 'Accept' Action (Seller)
- **Concept**: The seller confirms the transaction, moving the listing to a "Sold" state (locally or via sidecar).
- **Implementation**:
    - Add an "Accept" button to the `OffersList` items (already scaffolded but lacks logic).
    - When clicked, it generates a `Receipt` object.
    - **Metadata**: The `Receipt` references both the `Listing` CID and the `Offer` CID.
- **Data Model**: Uses `vco://schemas/marketplace/receipt/v1`.

### 3. Transaction State Management
- **Sold Status**: Once a `Receipt` is published, the `Listing` should ideally be marked as "Sold" in the UI.
- **Discovery**: Relays should index receipts so clients can filter out sold items from the "Browse" view.

## Proposed Strategy
1.  **Helper Functions**: Add `buildReceipt` to `lib/vco.ts`.
2.  **Buyer UI**: Update `ListingDetail` to include a "Buy Now" button.
3.  **Seller UI**: Implement the "Accept" button logic in `OffersList`.
4.  **State Updates**: Update `MarketplaceContext` to handle a collection of `Receipts`.

## UI/UX Considerations
- **Feedback**: Show a "Processing Transaction..." state during PoW generation.
- **History**: Completed transactions (Receipts) should appear in the "Sales & History" tab.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
