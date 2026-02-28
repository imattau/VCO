// packages/vco-marketplace/src/features/listings/MarketplaceContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ListingData } from "@vco/vco-schemas";
import { serialize, deserialize } from "../../lib/storage.js";

const LISTINGS_KEY = "vco_marketplace_listings";
const OFFERS_KEY = "vco_marketplace_offers";
const RECEIPTS_KEY = "vco_marketplace_receipts";

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

export interface ReceiptWithMetadata {
  id: string;
  listingId: string;
  offerId: string;
  txId: string;
  timestampMs: bigint;
  authorId: string;
  authorName: string;
  timestamp: number;
}

interface MarketplaceCtx {
  listings: ListingWithMetadata[];
  offers: OfferWithMetadata[];
  receipts: ReceiptWithMetadata[];
  envelopes: Map<string, Uint8Array>;
  addListing: (listing: ListingWithMetadata) => void;
  removeListing: (id: string) => void;
  addOffer: (offer: OfferWithMetadata) => void;
  addReceipt: (receipt: ReceiptWithMetadata) => void;
  addEnvelopes: (newEnvelopes: Map<string, Uint8Array>) => void;
}

const Ctx = createContext<MarketplaceCtx | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<ListingWithMetadata[]>([]);
  const [offers, setOffers] = useState<OfferWithMetadata[]>([]);
  const [receipts, setReceipts] = useState<ReceiptWithMetadata[]>([]);
  const [envelopes, setEnvelopes] = useState<Map<string, Uint8Array>>(new Map());

  // Load from storage on mount
  useEffect(() => {
    const savedListings = deserialize<ListingWithMetadata[]>(localStorage.getItem(LISTINGS_KEY));
    const savedOffers = deserialize<OfferWithMetadata[]>(localStorage.getItem(OFFERS_KEY));
    const savedReceipts = deserialize<ReceiptWithMetadata[]>(localStorage.getItem(RECEIPTS_KEY));
    const savedEnvelopesArr = deserialize<[string, Uint8Array][]>(localStorage.getItem("vco_marketplace_envelopes"));

    if (savedListings) setListings(savedListings);
    if (savedOffers) setOffers(savedOffers);
    if (savedReceipts) setReceipts(savedReceipts);
    if (savedEnvelopesArr) setEnvelopes(new Map(savedEnvelopesArr));
  }, []);

  // Persist to storage on change
  useEffect(() => {
    if (listings.length > 0) localStorage.setItem(LISTINGS_KEY, serialize(listings));
  }, [listings]);

  useEffect(() => {
    if (offers.length > 0) localStorage.setItem(OFFERS_KEY, serialize(offers));
  }, [offers]);

  useEffect(() => {
    if (receipts.length > 0) localStorage.setItem(RECEIPTS_KEY, serialize(receipts));
  }, [receipts]);

  useEffect(() => {
    if (envelopes.size > 0) {
      localStorage.setItem("vco_marketplace_envelopes", serialize(Array.from(envelopes.entries())));
    }
  }, [envelopes]);

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

  const addReceipt = (receipt: ReceiptWithMetadata) => {
    setReceipts((prev) => {
      if (prev.some((r) => r.id === receipt.id)) return prev;
      return [...prev, receipt];
    });
  };

  const addEnvelopes = (newEnvelopes: Map<string, Uint8Array>) => {
    setEnvelopes((prev) => {
      const next = new Map(prev);
      for (const [k, v] of newEnvelopes) {
        next.set(k, v);
      }
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ listings, offers, receipts, envelopes, addListing, removeListing, addOffer, addReceipt, addEnvelopes }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMarketplace(): MarketplaceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMarketplace requires MarketplaceProvider");
  return ctx;
}
