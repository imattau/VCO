// packages/vco-marketplace/src/features/listings/MarketplaceContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import type { ListingData } from "@vco/vco-schemas";

export interface ListingWithMetadata extends ListingData {
  id: string; // CID of the envelope
  authorId: string;
  authorName: string;
  powScore: number;
  timestamp: number;
}

export interface OfferWithMetadata {
  id: string;
  listingId: string;
  offerSats: bigint;
  message: string;
  authorId: string;
  authorName: string;
  timestamp: number;
}

interface MarketplaceCtx {
  listings: ListingWithMetadata[];
  offers: OfferWithMetadata[];
  addListing: (listing: ListingWithMetadata) => void;
  removeListing: (id: string) => void;
  addOffer: (offer: OfferWithMetadata) => void;
}

const Ctx = createContext<MarketplaceCtx | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<ListingWithMetadata[]>([]);
  const [offers, setOffers] = useState<OfferWithMetadata[]>([]);

  const addListing = (listing: ListingWithMetadata) => {
    setListings((prev) => {
      if (prev.some((l) => l.id === listing.id)) return prev;
      return [...prev, listing];
    });
  };

  const removeListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const addOffer = (offer: OfferWithMetadata) => {
    setOffers((prev) => {
      if (prev.some((o) => o.id === offer.id)) return prev;
      return [...prev, offer];
    });
  };

  return (
    <Ctx.Provider value={{ listings, offers, addListing, removeListing, addOffer }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMarketplace(): MarketplaceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMarketplace requires MarketplaceProvider");
  return ctx;
}
