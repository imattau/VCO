// packages/vco-marketplace/src/features/listings/OffersList.tsx
import type { OfferWithMetadata, ListingWithMetadata } from "./MarketplaceContext.js";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  mode: "buying" | "selling";
  offers: OfferWithMetadata[];
  listings: ListingWithMetadata[];
  onAccept: (offer: OfferWithMetadata) => void;
}

export function OffersList({ mode, offers, listings, onAccept }: Props) {
  if (offers.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
        <p className="text-zinc-500 text-sm">
          {mode === "selling" ? "No offers received yet." : "You haven't made any offers yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((o) => {
        const listing = listings.find(l => l.id === o.listingId);
        return (
          <div key={o.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-zinc-600">
              ITEM
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-white">
                  {mode === "selling" ? o.authorName : (listing?.authorName ?? "Unknown Seller")}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-black">
                  {mode === "selling" ? "Offer Received" : "Your Offer"}
                </span>
              </div>
              <div className="text-xs text-zinc-400 truncate">
                {mode === "selling" ? "For: " : "To: "}
                <span className="text-zinc-200 font-medium">{listing?.title ?? "Unknown Item"}</span>
              </div>
              {o.message && <div className="text-[11px] text-zinc-500 mt-1 italic">"{o.message}"</div>}
            </div>
            <div className="text-right px-4 border-r border-zinc-800">
               <div className="text-lg font-black text-indigo-400">{o.offerSats.toLocaleString()}</div>
               <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">SATS</div>
            </div>
            {mode === "selling" && (
              <div className="flex gap-2">
                <button 
                  onClick={() => onAccept(o)}
                  className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" 
                  title="Accept"
                >
                  <CheckCircle size={20} />
                </button>
                <button className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Reject"><XCircle size={20} /></button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
