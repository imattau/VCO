// packages/vco-marketplace/src/features/listings/TradeHistory.tsx
import { Avatar } from "../../components/ui/Avatar.js";
import { Badge } from "../../components/ui/Badge.js";
import { ReceiptWithMetadata, ListingWithMetadata } from "./MarketplaceContext.js";
import { ExternalLink, ShoppingBag, Tag } from "lucide-react";

interface Props {
  receipts: ReceiptWithMetadata[];
  listings: ListingWithMetadata[];
  userId: string;
}

export function TradeHistory({ receipts, listings, userId }: Props) {
  if (receipts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-700 border border-zinc-800">
           <ShoppingBag size={24} />
        </div>
        <h3 className="text-lg font-bold text-zinc-400">No transaction history</h3>
        <p className="text-sm text-zinc-600 mt-1">Completed trades will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {receipts.map((r) => {
        const isSale = r.authorId === userId;
        const listing = listings.find((l) => l.id === r.listingId);
        
        return (
          <div key={r.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex items-center gap-6 hover:border-zinc-700 transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSale ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
              {isSale ? <Tag size={24} /> : <ShoppingBag size={24} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isSale ? "success" : "default"}>
                  {isSale ? "SALE" : "PURCHASE"}
                </Badge>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                  TX: {r.txId}
                </span>
              </div>
              <h4 className="text-white font-bold truncate">
                {listing?.title ?? "Unknown Item"}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                <span>{isSale ? "Sold to:" : "Bought from:"}</span>
                <Avatar name={r.authorName} size="sm" />
                <span className="font-medium text-zinc-400">{r.authorName}</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
               <div className="text-lg font-black text-white">
                 {listing?.priceSats.toLocaleString() ?? "???"} <span className="text-[10px] text-indigo-400 uppercase">Sats</span>
               </div>
               <div className="text-[10px] text-zinc-600 font-mono">
                 {new Date(r.timestamp).toLocaleDateString()}
               </div>
               <button className="text-zinc-500 hover:text-zinc-300 mt-1">
                 <ExternalLink size={14} />
               </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
