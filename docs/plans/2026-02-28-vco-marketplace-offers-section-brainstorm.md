# Brainstorming: Dedicated Offers Section in VCO Marketplace

## Objective
Design a dedicated "Offers" section where users can track both incoming offers (on their items) and outgoing offers (on others' items).

## Section Structure

### 1. Tabbed/Filtered View
Within the "Offers" section, provide two sub-views:
- **Buying**: Offers I have made to others.
- **Selling**: Offers I have received from others.

### 2. Information Display
For each offer, show:
- **Item**: Thumbnail and title of the `Listing`.
- **Amount**: The price offered in SATS.
- **Counterparty**: The seller (for buying) or buyer (for selling).
- **Status**: 
    - *Pending*: No receipt yet.
    - *Accepted*: A `Receipt` exists referencing this `Offer`.
    - *Rejected*: (Future) A specific rejection object or just removal.

### 3. Actions
- **Buying Tab**: 
    - "Cancel Offer" (removes local state or publishes a tombstone).
    - "View Listing".
- **Selling Tab**:
    - "Accept" (generates `Receipt`).
    - "Reject" (removes from list).

## Proposed UI Changes
1. **Sidebar**: Replace "Sales & History" with "Offers".
2. **Main Area**: When "Offers" is active, show a toggle for "Buying" vs "Selling".
3. **Component**: Reuse and expand `OffersList.tsx` to handle both modes.

## Technical Implementation
- **Identification**: Use `uint8ArrayToHex(identity.creatorId)` to distinguish between incoming and outgoing offers.
- **Context**: Ensure `MarketplaceContext` has all necessary data (it already has `offers` and `listings`).

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
