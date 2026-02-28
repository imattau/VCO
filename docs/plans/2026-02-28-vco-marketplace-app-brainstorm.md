# Brainstorming: VCO Marketplace Application

## Objective
Design a decentralized marketplace application ("VCO Marketplace") that leverages the existing `@vco/vco-schemas` (Listing, Offer, Receipt) and `@vco/vco-core` messaging capabilities.

## Core Features

### 1. Discovery & Listings
- **Browse Listings**: View available items/services posted to the network.
- **Search & Filter**: Leverage `tags` (e.g., `#category:electronics`, `#geo:sydney`) for efficient discovery via relays.
- **Listing Details**: Display item description, price (using VCO-standard pricing schema), and media (images hosted on VCO).

### 2. Transaction Lifecycle
- **Create Listing**: User signs and publishes a `Listing` object.
- **Make Offer**: Interested buyer signs and publishes an `Offer` object referencing the Listing CID.
- **Negotiation**: Integrated messaging (using `Reply` or a dedicated `Chat` schema) between buyer and seller.
- **Accept/Reject Offer**: Seller publishes a `Receipt` (for acceptance) or a notification.
- **Escrow/Payment**: (Future) Integration with payment providers or crypto-escrow.

### 3. Identity & Reputation
- **Seller Profiles**: View seller's VCO identity, display name, and historical receipts.
- **Verifiable Reviews**: Users can sign reviews/ratings for completed transactions.

### 4. Messaging Integration
- **Private Negotiation**: Encrypted message streams between buyer and seller.
- **Structured Notifications**: Automated alerts for new offers, acceptances, and shipping updates.

## Technical Architecture

### App Shell (`vco-marketplace`)
- **Framework**: Tauri + React + Tailwind (consistent with `vco-cord`).
- **State Management**: Context-based (Identity, Listings, Active Deals).

### Integration Points
- **`@vco/vco-core`**: Used for envelope management and PoW.
- **`@vco/vco-schemas`**: Primary data models for all marketplace objects.
- **`@vco/vco-sync`**: Range-based reconciliation to fetch the latest listings from relays.
- **`@vco/vco-transport`**: P2P communication for real-time negotiations.

## Proposed MVP Strategy
1.  **Scaffold Application**: Create a new package `packages/vco-marketplace`.
2.  **Listing Feed**: Implement a basic UI to create and browse listings from a local/specified relay.
3.  **Offer Flow**: Implement "Buy Now" or "Make Offer" logic that publishes the appropriate schema objects.
4.  **Deal History**: A simple "Dashboard" view showing user's own listings and active purchases.

## Risks & Considerations
- **Relay Indexing**: Need to ensure relays index the specific marketplace schema URIs.
- **Spam Control**: Leverage PoW difficulty for listing creation.
- **Privacy**: Messaging must be encrypted to protect transaction details.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
