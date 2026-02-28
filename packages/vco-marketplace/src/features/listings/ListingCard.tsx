// packages/vco-marketplace/src/features/listings/ListingCard.tsx
import { Avatar } from "../../components/ui/Avatar.js";
import { VcoImage } from "../../components/ui/VcoImage.js";
import { uint8ArrayToHex } from "../../lib/vco.js";
import type { ListingWithMetadata } from "./MarketplaceContext.js";

interface Props {
  listing: ListingWithMetadata;
  isSold?: boolean;
  onDetail: (listing: ListingWithMetadata) => void;
}

export function ListingCard({ listing, isSold, onDetail }: Props) {
  const primaryMediaCid = listing.mediaCids.length > 0 
    ? uint8ArrayToHex(listing.mediaCids[0]) 
    : null;

  return (
    <div className={`bg-zinc-900/40 border border-zinc-800/50 rounded-xl overflow-hidden group hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 ${isSold ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <div className="aspect-[4/3] bg-zinc-800/50 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-800 transition-colors relative">
        {primaryMediaCid ? (
          <VcoImage cid={primaryMediaCid} className="w-full h-full" />
        ) : (
          <span className="text-xs font-mono uppercase tracking-widest opacity-20">No Media</span>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
           <div className="px-2 py-1 bg-zinc-950/80 backdrop-blur rounded text-[10px] font-bold text-zinc-400 border border-zinc-800">
             POW {listing.powScore}
           </div>
           {isSold && (
             <div className="px-2 py-1 bg-emerald-600 backdrop-blur rounded text-[10px] font-black text-white border border-emerald-500 shadow-lg shadow-emerald-500/20">
               SOLD
             </div>
           )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Avatar name={listing.authorName} size="sm" />
          <span className="text-[10px] font-bold text-zinc-400">{listing.authorName}</span>
          <span className="text-[10px] text-zinc-600 font-mono ml-auto">{listing.id.slice(0, 8)}</span>
        </div>
        <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors truncate">{listing.title}</h3>
        <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed h-8">{listing.description}</p>
        
        <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Price</span>
            <span className="font-black text-xl text-white">
              {listing.priceSats.toLocaleString()} <span className="text-xs text-indigo-400 font-bold font-mono">SATS</span>
            </span>
          </div>
          <button 
            onClick={() => onDetail(listing)}
            className="bg-zinc-800 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 px-5 rounded-lg uppercase tracking-wider transition-all border border-zinc-700 hover:border-indigo-500 shadow-lg active:scale-95"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  );
}
